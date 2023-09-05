import { SearchClient } from '@azure/search-documents';
import { DynamicTool } from 'langchain/tools';
import { PromptTemplate } from 'langchain/prompts';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { OpenAiService } from '../../plugins/openai.js';
import { LangchainService } from '../../plugins/langchain.js';
import { AskApproach } from './approach.js';
import { ApproachBase } from './approach-base.js';

const EXAMPLES = [
  `Question: What is the elevation range for the area that the eastern sector of the Colorado orogeny extends into?
Thought: I need to search Colorado orogeny, find the area that the eastern sector of the Colorado orogeny extends into, then find the elevation range of the area.
Action: Search[Colorado orogeny]
Observation: <info1.pdf> The Colorado orogeny was an episode of mountain building (an orogeny) in Colorado and surrounding areas.
Thought: It does not mention the eastern sector. So I need to look up eastern sector.
Action: Lookup[eastern sector]
Observation: <info2.txt> (Result 1 / 1) The eastern sector extends into the High Plains and is called the Central Plains orogeny.
Thought: The eastern sector of Colorado orogeny extends into the High Plains. So I need to search High Plains and find its elevation range.
Action: Search[High Plains]
Observation: <some_file.pdf> High Plains refers to one of two distinct land regions
Thought: I need to instead search High Plains (United States).
Action: Search[High Plains (United States)]
Observation: <filea.pdf> The High Plains are a subregion of the Great Plains. <another-ref.docx> From east to west, the High Plains rise in elevation from around 1,800 to 7,000 ft (550 to 2,130 m).
Thought: High Plains rise in elevation from around 1,800 to 7,000 ft, so the answer is 1,800 to 7,000 ft.
Action: Finish[1,800 to 7,000 ft <filea.pdf>]`,
  `Question: Musician and satirist Allie Goertz wrote a song about the "The Simpsons" character Milhouse, who Matt Groening named after who?
Thought: The question simplifies to "The Simpsons" character Milhouse is named after who. I only need to search Milhouse and find who it is named after.
Action: Search[Milhouse]
Observation: <info7.pdf> Milhouse Mussolini Van Houten is a recurring character in the Fox animated television series The Simpsons voiced by Pamela Hayden and created by Matt Groening.
Thought: The paragraph does not tell who Milhouse is named after, maybe I can look up "named after".
Action: Lookup[named after]
Observation: <historyref2.txt> (Result 1 / 1) Milhouse was named after U.S. president Richard Nixon, whose middle name was Milhous.
Thought: Milhouse was named after U.S. president Richard Nixon, so the answer is Richard Nixon.
Action: Finish[Richard Nixon <historyref2.txt>]`,
  `Question: Which documentary is about Finnish rock groups, Adam Clayton Powell or The Saimaa Gesture?
Thought: I need to search Adam Clayton Powell and The Saimaa Gesture, and find which documentary is about Finnish rock groups.
Action: Search[Adam Clayton Powell]
Observation: <info9.pdf> Could not find [Adam Clayton Powell]. Similar: ['Adam Clayton Powell III', 'Seventh Avenue (Manhattan)', 'Adam Clayton Powell Jr. State Office Building', 'Isabel Washington Powell', 'Adam Powell', vAdam Clayton Powell (film)', 'Giancarlo Esposito'].
Thought: To find the documentary, I can search Adam Clayton Powell (film).
Action: Search[Adam Clayton Powell (film)]
Observation: <data123.txt> Adam Clayton Powell is a 1989 American documentary film directed by Richard Kilberg. The film is about the rise and fall of influential African-American politician Adam Clayton Powell Jr.[3][4] It was later aired as part of the PBS series The American Experience.
Thought: Adam Clayton Powell (film) is a documentary about an African-American politician, not Finnish rock groups. So the documentary about Finnish rock groups must instead be The Saimaa Gesture.
Action: Finish[The Saimaa Gesture <data123.txt>]`,
  `Question: What profession does Nicholas Ray and Elia Kazan have in common?
Thought: I need to search Nicholas Ray and Elia Kazan, find their professions, then find the profession they have in common.
Action: Search[Nicholas Ray]
Observation: <files-987.png> Nicholas Ray (born Raymond Nicholas Kienzle Jr., August 7, 1911 - June 16, 1979) was an American film director, screenwriter, and actor best known for the 1955 film Rebel Without a Cause.
Thought: Professions of Nicholas Ray are director, screenwriter, and actor. I need to search Elia Kazan next and find his professions.
Action: Search[Elia Kazan]
Observation: <files-654.txt> Elia Kazan was an American film and theatre director, producer, screenwriter and actor.
Thought: Professions of Elia Kazan are director, producer, screenwriter, and actor. So profession Nicholas Ray and Elia Kazan have in common is director, screenwriter, and actor.
Action: Finish[director, screenwriter, actor <files-987.png><files-654.txt>]`,
  `Question: Which magazine was started first Arthur's Magazine or First for Women?
Thought: I need to search Arthur's Magazine and First for Women, and find which was started first.
Action: Search[Arthur's Magazine]
Observation: <magazines-1850.pdf> Arthur's Magazine (1844-1846) was an American literary periodical published in Philadelphia in the 19th century.
Thought: Arthur's Magazine was started in 1844. I need to search First for Women next.
Action: Search[First for Women]
Observation: <magazines-1900.pdf> First for Women is a woman's magazine published by Bauer Media Group in the USA.[1] The magazine was started in 1989.
Thought: First for Women was started in 1989. 1844 (Arthur's Magazine) < 1989 (First for Women), so Arthur's Magazine was started first.
Action: Finish[Arthur's Magazine <magazines-1850.pdf><magazines-1900.pdf>]`,
  `Question: Were Pavel Urysohn and Leonid Levin known for the same type of work?
Thought: I need to search Pavel Urysohn and Leonid Levin, find their types of work, then find if they are the same.
Action: Search[Pavel Urysohn]
Observation: <info4444.pdf> Pavel Samuilovich Urysohn (February 3, 1898 - August 17, 1924) was a Soviet mathematician who is best known for his contributions in dimension theory.
Thought: Pavel Urysohn is a mathematician. I need to search Leonid Levin next and find its type of work.
Action: Search[Leonid Levin]
Observation: <datapoints_aaa.txt> Leonid Anatolievich Levin is a Soviet-American mathematician and computer scientist.
Thought: Leonid Levin is a mathematician and computer scientist. So Pavel Urysohn and Leonid Levin have the same type of work.
Action: Finish[yes <info4444.pdf><datapoints_aaa.txt>]`,
];

const SUFFIX = `\nQuestion: {input}\n{agent_scratchpad}`;
const PREFIX =
  'Answer questions as shown in the following examples, by splitting the question into individual search or lookup actions to find facts until you can answer the question. ' +
  'Observations are prefixed by their source name in angled brackets, source names MUST be included with the actions in the answers.' +
  'All questions must be answered from the results from search or look up actions, only facts resulting from those can be used in an answer. ' +
  'Answer questions as truthfully as possible, and ONLY answer the questions using the information from observations, do not speculate or your own knowledge.';

export class AskReadDecomposeAsk extends ApproachBase implements AskApproach {
  constructor(
    private langchain: LangchainService,
    search: SearchClient<any>,
    openai: OpenAiService,
    chatGptModel: string,
    sourcePageField: string,
    contentField: string,
  ) {
    super(search, openai, chatGptModel, sourcePageField, contentField);
  }

  async run(userQuery: string, overrides: Record<string, any>): Promise<any> {
    let searchResults: string[] = [];

    const searchAndStore = async (query: string): Promise<string> => {
      const { results, content } = await this.searchDocuments(query, overrides);
      searchResults = results;
      return content;
    };

    const chatModel = await this.langchain.getChat({
      temperature: overrides?.temperature || 0.3,
    });

    const tools = [
      new DynamicTool({
        name: 'Search',
        func: searchAndStore,
        description: 'useful for when you need to ask with search',
      }),
      new DynamicTool({
        name: 'Lookup',
        func: (query: string) => this.lookupDocument(query),
        description: 'useful for when you need to ask with lookup',
      }),
    ];

    // TODO: port ReactDocStore agent

    const promptPrefix = overrides?.promptTemplate;
    const prompt = PromptTemplate.fromExamples(
      EXAMPLES,
      SUFFIX,
      ['input', 'agent_scratchpad'],
      undefined,
      promptPrefix ? `${promptPrefix}\n\n${PREFIX}` : PREFIX,
    );

    // TODO: remove
    console.log(prompt);

    const executor = await initializeAgentExecutorWithOptions(tools, chatModel, {
      agentType: 'chat-zero-shot-react-description', // "structured-chat-zero-shot-react-description" in types
      returnIntermediateSteps: true,
      verbose: true,
    });
    const result = await await executor.call({ input: userQuery });

    // Replace substrings of the form <file.ext> with [file.ext] so that the frontend can render them as links,
    // match them with a regex to avoid generalizing too much and disrupt HTML snippets if present
    const formattedResult = result.replace(/<([a-zA-Z0-9_ \-.]+)>/g, '[$1]');

    return {
      data_points: searchResults,
      answer: formattedResult,
      thoughts: `Though process:\n${JSON.stringify(result.intermediateSteps, null, 2)}`, // TODO: format to HTML?
    };
  }
}
