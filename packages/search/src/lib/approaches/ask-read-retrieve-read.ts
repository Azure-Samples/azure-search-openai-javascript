import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type SearchClient } from '@azure/search-documents';
import { DynamicTool, type ToolParams } from 'langchain/tools';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { CallbackManager } from 'langchain/callbacks';
import { type OpenAiService } from '../../plugins/openai.js';
import { type LangchainService } from '../../plugins/langchain.js';
import { CsvLookupTool, HtmlCallbackHandler } from '../langchain/index.js';
import {
  type ApproachResponseChunk,
  type ApproachContext,
  type AskApproach,
  type ApproachResponse,
} from './approach.js';
import { ApproachBase } from './approach-base.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMPLATE_PREFIX = `You are an intelligent assistant helping Consto Real Estate company customers with support questions regarding terms of service, privacy policy, and questions about support requests.
Answer the question using only the data provided in the information sources below.
For tabular information return it as an html table. Do not return markdown format.
Each source has a name followed by colon and the actual data, quote the source name for each piece of data you use in the response.
For example, if the question is "What color is the sky?" and one of the information sources says "info123: the sky is blue whenever it's not cloudy", then answer with "The sky is blue [info123]"
It's important to strictly follow the format where the name of the source is in square brackets at the end of the sentence, and only up to the prefix before the colon (":").
If there are multiple sources, cite each one in their own square brackets. For example, use "[info343][ref-76]" and not "[info343,ref-76]".
Never quote tool names as sources.
If you cannot answer using the sources below, say that you don't know.

You can access to the following tools:`;

const TEMPLATE_SUFFIX = `Begin!

Question: {input}

Thought: {agent_scratchpad}`;

/**
 * Attempt to answer questions by iteratively evaluating the question to see what information is missing,
 * and once all information is present then formulate an answer. Each iteration consists of two parts:
 *   1. use GPT to see if we need more information
 *   2. if more data is needed, use the requested "tool" to retrieve it.
 * The last call to GPT answers the actual question.
 * This is inspired by the MKRL paper[1] and applied here using the implementation in Langchain.
 * [1] E. Karpas, et al. arXiv:2205.00445
 */
export class AskReadRetrieveRead extends ApproachBase implements AskApproach {
  constructor(
    private langchain: LangchainService,
    search: SearchClient<any>,
    openai: OpenAiService,
    chatGptModel: string,
    embeddingModel: string,
    sourcePageField: string,
    contentField: string,
  ) {
    super(search, openai, chatGptModel, embeddingModel, sourcePageField, contentField);
  }

  async run(userQuery: string, context?: ApproachContext): Promise<ApproachResponse> {
    let searchResults: string[] = [];

    const htmlTracer = new HtmlCallbackHandler();
    const callbackManager = new CallbackManager();
    callbackManager.addHandler(htmlTracer);

    const searchAndStore = async (query: string): Promise<string> => {
      const { results, content } = await this.searchDocuments(query, context);
      searchResults = results;
      return content;
    };

    const tools = [
      new DynamicTool({
        name: 'CognitiveSearch',
        func: searchAndStore,
        description:
          'useful for searching company related documents such as terms of service, privacy policy, and questions about support requests',
        callbacks: callbackManager,
      }),
      new EmployeeInfoTool('Employee1', { callbacks: callbackManager }),
    ];

    const chatModel = await this.langchain.getChat({
      temperature: Number(context?.temperature) || 0.3,
    });

    const executor = await initializeAgentExecutorWithOptions(tools, chatModel, {
      agentType: 'chat-zero-shot-react-description',
      agentArgs: {
        prefix: context?.prompt_template_prefix || TEMPLATE_PREFIX,
        suffix: context?.prompt_template_suffix || TEMPLATE_SUFFIX,
        inputVariables: ['input', 'agent_scratchpad'],
      },
      returnIntermediateSteps: true,
      callbackManager,
      verbose: true,
    });

    const result = await executor.call({ input: userQuery });

    // Remove references to tool names that might be confused with a citation
    const answer = result.output.replace('[CognitiveSearch]', '').replace('[Employee]', '');

    return {
      choices: [
        {
          index: 0,
          message: {
            content: answer,
            role: 'assistant' as const,
            context: {
              data_points: {
                text: searchResults,
              },
              thoughts: htmlTracer.getAndResetLog(),
            },
          },
        },
      ],
      object: 'chat.completion',
    };
  }

  // eslint-disable-next-line require-yield
  async *runWithStreaming(_query: string, _context?: ApproachContext): AsyncGenerator<ApproachResponseChunk, void> {
    throw new Error('Streaming not supported for this approach.');
  }
}

class EmployeeInfoTool extends CsvLookupTool {
  static lc_name(): string {
    return 'EmployeeInfoTool';
  }

  name = 'Employee';
  description =
    'useful to look up details given an input key as opposite to searching data with an unstructured question';

  constructor(
    private employeeName: string,
    options?: ToolParams,
  ) {
    super(path.join(__dirname, '../../../data/employee-info.csv'), 'name', options);
  }

  async _call(input: string): Promise<string> {
    await this.loadFile();
    input = input?.trim();

    // Only managers can access other employees' information
    const isManager = this.lookup(this.employeeName).title?.toLowerCase().includes('manager');
    return isManager || input?.toLowerCase() === this.employeeName.toLowerCase()
      ? this.lookupAsString(input)
      : 'I am not allowed to share that information with you.';
  }
}
