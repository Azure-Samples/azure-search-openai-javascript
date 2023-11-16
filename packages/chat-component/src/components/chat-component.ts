/* eslint-disable unicorn/template-indent */
import { LitElement, html } from 'lit';
import DOMPurify from 'dompurify';
import { customElement, property, query, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { chatHttpOptions, globalConfig, requestOptions } from '../config/global-config.js';
import { getAPIResponse } from '../core/http/index.js';
import { parseStreamedMessages } from '../core/parser/index.js';
import { chatStyle } from '../styles/chat-component.js';
import { type ChatResponseError, getTimestamp, processText } from '../utils/index.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
// TODO: allow host applications to customize these icons

import iconLightBulb from '../../public/svg/lightbulb-icon.svg?raw';
import iconDelete from '../../public/svg/delete-icon.svg?raw';
import iconCancel from '../../public/svg/cancel-icon.svg?raw';
import iconSend from '../../public/svg/send-icon.svg?raw';
import iconClose from '../../public/svg/close-icon.svg?raw';

import './loading-indicator.js';
import './voice-input-button.js';
import './teaser-list-component.js';
import './document-previewer.js';
import './tab-component.js';
import './citation-list.js';
import './chat-thread-component.js';
import './chat-action-button.js';
import { type TabContent } from './tab-component.js';

/**
 * A chat component that allows the user to ask questions and get answers from an API.
 * The component also displays default prompts that the user can click on to ask a question.
 * The component is built as a custom element that extends LitElement.
 *
 * Labels and other aspects are configurable via properties that get their values from the global config file.
 * @element chat-component
 * @fires chat-component#questionSubmitted - Fired when the user submits a question
 * @fires chat-component#defaultQuestionClicked - Fired when the user clicks on a default question
 * */

@customElement('chat-component')
export class ChatComponent extends LitElement {
  //--
  // Public attributes
  // -

  @property({ type: String, attribute: 'data-input-position' })
  inputPosition = 'sticky';

  @property({ type: String, attribute: 'data-interaction-model' })
  interactionModel: 'ask' | 'chat' = 'chat';

  @property({ type: String, attribute: 'data-api-url' })
  apiUrl = chatHttpOptions.url;

  @property({ type: String, attribute: 'data-use-stream', converter: (value) => value?.toLowerCase() === 'true' })
  useStream: boolean = chatHttpOptions.stream;

  @property({ type: String, attribute: 'data-overrides', converter: (value) => JSON.parse(value || '{}') })
  overrides: RequestOverrides = {};

  //--

  @property({ type: String })
  currentQuestion = '';

  @query('#question-input')
  questionInput!: HTMLInputElement;

  // Default prompts to display in the chat
  @state()
  isDisabled = false;

  @state()
  isChatStarted = false;

  @state()
  isResetInput = false;

  // The program is awaiting response from API
  @state()
  isAwaitingResponse = false;

  // Show error message to the end-user, if API call fails
  @property({ type: Boolean })
  hasAPIError = false;

  // Has the response been copied to the clipboard
  @state()
  isResponseCopied = false;

  // Is showing thought process panel
  @state()
  isShowingThoughtProcess = false;

  @state()
  canShowThoughtProcess = false;

  @state()
  isDefaultPromptsEnabled: boolean = globalConfig.IS_DEFAULT_PROMPTS_ENABLED && !this.isChatStarted;

  @state()
  isProcessingResponse = false;

  @state()
  selectedCitation: Citation | undefined = undefined;

  selectedAsideTab: 'tab-thought-process' | 'tab-support-context' | 'tab-citations' = 'tab-thought-process';

  // api response
  apiResponse = {} as BotResponse | Response;
  // These are the chat bubbles that will be displayed in the chat
  chatThread: ChatThreadEntry[] = [];
  defaultPrompts: string[] = globalConfig.DEFAULT_PROMPTS;
  defaultPromptsHeading: string = globalConfig.DEFAULT_PROMPTS_HEADING;
  chatButtonLabelText: string = globalConfig.CHAT_BUTTON_LABEL_TEXT;
  chatThoughts: string | null = '';
  chatDataPoints: string[] = [];

  abortController: AbortController = new AbortController();

  chatRequestOptions: ChatRequestOptions = requestOptions;
  chatHttpOptions: ChatHttpOptions = chatHttpOptions;

  static override styles = [chatStyle];

  // Send the question to the Open AI API and render the answer in the chat

  // Add a message to the chat, when the user or the API sends a message
  async processApiResponse({ message, isUserMessage }: { message: string; isUserMessage: boolean }) {
    const citations: Citation[] = [];
    const followingSteps: string[] = [];
    const followupQuestions: string[] = [];
    // Get the timestamp for the message
    const timestamp = getTimestamp();
    const updateChatWithMessageOrChunk = async (part: string, isChunk: boolean) => {
      if (isChunk) {
        // we need to prepare an empty instance of the chat message so that we can start populating it
        this.chatThread = [
          ...this.chatThread,
          {
            text: [{ value: '', followingSteps: [] }],
            followupQuestions: [],
            citations: [],
            timestamp: timestamp,
            isUserMessage,
          },
        ];

        this.isProcessingResponse = true;

        const result = await parseStreamedMessages({
          chatThread: this.chatThread,
          signal: this.abortController.signal,
          apiResponseBody: (this.apiResponse as Response).body,
          onChunkRead: () => {
            // NOTE: this function is called whenever we mutate sub-properties of the array
            // so we need to trigger a re-render
            this.requestUpdate('chatThread');
          },
          onCancel: () => {
            this.isProcessingResponse = false;
            // TODO: show a message to the user that the response has been cancelled
          },
        });
        // this will be processing thought process only with streaming enabled
        this.chatThoughts = result.thoughts;
        this.chatDataPoints = result.data_points;
        this.canShowThoughtProcess = true;

        this.isProcessingResponse = false;

        return true;
      }

      this.chatThread = [
        ...this.chatThread,
        {
          text: [
            {
              value: part,
              followingSteps,
            },
          ],
          followupQuestions,
          citations: [...new Set(citations)],
          timestamp: timestamp,
          isUserMessage,
        },
      ];
      return true;
    };

    // Check if message is a bot message to process citations and follow-up questions
    if (isUserMessage) {
      updateChatWithMessageOrChunk(message, false);
    } else {
      if (this.useStream) {
        await updateChatWithMessageOrChunk(message, true);
      } else {
        // non-streamed response
        const processedText = processText(message, [citations, followingSteps, followupQuestions]);
        message = processedText.replacedText;
        // Push all lists coming from processText to the corresponding arrays
        citations.push(...(processedText.arrays[0] as unknown as Citation[]));
        followingSteps.push(...(processedText.arrays[1] as string[]));
        followupQuestions.push(...(processedText.arrays[2] as string[]));
        updateChatWithMessageOrChunk(message, false);
      }
    }
  }

  setQuestionInputValue(value: string): void {
    this.questionInput.value = DOMPurify.sanitize(value || '');
    this.currentQuestion = this.questionInput.value;
  }

  handleVoiceInput(event: CustomEvent): void {
    event?.preventDefault();
    this.setQuestionInputValue(event?.detail?.input);
  }

  handleQuestionInputClick(event: CustomEvent): void {
    event?.preventDefault();
    this.setQuestionInputValue(event?.detail?.question);
  }

  handleCitationClick(event: CustomEvent): void {
    event?.preventDefault();
    this.selectedCitation = event?.detail?.citation;

    if (!this.isShowingThoughtProcess) {
      this.handleExpandAside();
      this.selectedAsideTab = 'tab-citations';
    }
  }

  // Handle the click on the chat button and send the question to the API
  async handleUserChatSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.collapseAside(event);
    const question = DOMPurify.sanitize(this.questionInput.value);
    if (question) {
      this.currentQuestion = question;
      try {
        const type = this.interactionModel;
        // Remove default prompts
        this.isChatStarted = true;
        this.isDefaultPromptsEnabled = false;
        // Disable the input field and submit button while waiting for the API response
        this.isDisabled = true;
        // clear out errors
        this.hasAPIError = false;
        // Show loading indicator while waiting for the API response
        this.isAwaitingResponse = true;
        if (type === 'chat') {
          this.processApiResponse({ message: question, isUserMessage: true });
        }

        this.apiResponse = await getAPIResponse(
          {
            ...this.chatRequestOptions,
            overrides: {
              ...this.chatRequestOptions.overrides,
              ...this.overrides,
            },
            question,
            type,
          },
          {
            // use defaults
            ...this.chatHttpOptions,

            // override if the user has provided different values
            url: this.apiUrl,
            stream: this.useStream,
          },
        );

        this.questionInput.value = '';
        this.isAwaitingResponse = false;
        this.isDisabled = false;
        this.isResetInput = false;
        const response = this.apiResponse as BotResponse;
        // adds thought process support when streaming is disabled
        if (!this.useStream) {
          this.chatThoughts = response.choices[0].message.context?.thoughts ?? '';
          this.chatDataPoints = response.choices[0].message.context?.data_points ?? [];
          this.canShowThoughtProcess = true;
        }
        await this.processApiResponse({
          message: this.useStream ? '' : response.choices[0].message.content,
          isUserMessage: false,
        });
      } catch (error_: any) {
        console.error(error_);

        const error = error_ as ChatResponseError;
        const chatError = {
          message: error?.code === 400 ? globalConfig.INVALID_REQUEST_ERROR : globalConfig.API_ERROR_MESSAGE,
        };

        if (this.isProcessingResponse && this.chatThread.at(-1)) {
          const processingThread = this.chatThread.at(-1);
          if (processingThread) {
            processingThread.error = chatError;
          }
        } else {
          this.chatThread = [
            ...this.chatThread,
            {
              error: chatError,
              text: [],
              timestamp: getTimestamp(),
              isUserMessage: false,
            },
          ];
        }

        this.handleAPIError();
      }
    }
  }

  // Reset the input field and the current question
  resetInputField(event: Event): void {
    event.preventDefault();
    this.questionInput.value = '';
    this.currentQuestion = '';
    this.isResetInput = false;
  }

  // Reset the chat and show the default prompts
  resetCurrentChat(event: Event): void {
    this.isChatStarted = false;
    this.chatThread = [];
    this.isDisabled = false;
    this.isDefaultPromptsEnabled = true;
    this.isResponseCopied = false;
    this.collapseAside(event);
    this.handleUserChatCancel(event);
  }

  // Show the default prompts when enabled
  showDefaultPrompts(event: Event): void {
    if (!this.isDefaultPromptsEnabled) {
      this.resetCurrentChat(event);
    }
  }

  // Handle the change event on the input field
  handleOnInputChange(): void {
    this.isResetInput = !!this.questionInput.value;
  }

  // Handle API error
  handleAPIError(): void {
    this.hasAPIError = true;
    this.isDisabled = false;
    this.isAwaitingResponse = false;
    this.isProcessingResponse = false;
  }

  // Stop generation
  handleUserChatCancel(event: Event): any {
    event?.preventDefault();
    this.isProcessingResponse = false;
    this.abortController.abort();

    // we have to reset the abort controller so that we can use it again
    this.abortController = new AbortController();
  }

  // show thought process aside
  handleExpandAside(event: Event | undefined = undefined): void {
    event?.preventDefault();
    this.isShowingThoughtProcess = true;
    this.selectedAsideTab = 'tab-thought-process';
    this.shadowRoot?.querySelector('#overlay')?.classList.add('active');
    this.shadowRoot?.querySelector('#chat__containerWrapper')?.classList.add('aside-open');
  }

  // hide thought process aside
  collapseAside(event: Event): void {
    event.preventDefault();
    this.isShowingThoughtProcess = false;
    this.shadowRoot?.querySelector('#chat__containerWrapper')?.classList.remove('aside-open');
    this.shadowRoot?.querySelector('#overlay')?.classList.remove('active');
  }

  renderChatOrCancelButton() {
    const submitChatButton = html`<button
      class="chatbox__button"
      data-testid="submit-question-button"
      @click="${this.handleUserChatSubmit}"
      title="${globalConfig.CHAT_BUTTON_LABEL_TEXT}"
      ?disabled="${this.isDisabled}"
    >
      ${unsafeSVG(iconSend)}
    </button>`;
    const cancelChatButton = html`<button
      class="chatbox__button"
      data-testid="cancel-question-button"
      @click="${this.handleUserChatCancel}"
      title="${globalConfig.CHAT_CANCEL_BUTTON_LABEL_TEXT}"
    >
      ${unsafeSVG(iconCancel)}
    </button>`;

    return this.isProcessingResponse ? cancelChatButton : submitChatButton;
  }

  handleChatEntryActionButtonClick(event: CustomEvent) {
    if (event.detail?.id === 'chat-show-thought-process') {
      this.handleExpandAside(event);
    }
  }

  // Render the chat component as a web component
  override render() {
    return html`
      <div id="overlay" class="overlay"></div>
      <section id="chat__containerWrapper" class="chat__containerWrapper">
        <section class="chat__container" id="chat-container">
          ${this.isChatStarted
            ? html`
                <div class="chat__header">
                  <chat-action-button
                    .label="${globalConfig.RESET_CHAT_BUTTON_TITLE}"
                    actionId="chat-reset-button"
                    @click="${this.resetCurrentChat}"
                    .svgIcon="${iconDelete}"
                  >
                  </chat-action-button>
                </div>
                <chat-thread-component
                  .chatThread="${this.chatThread}"
                  .actionButtons="${[
                    {
                      id: 'chat-show-thought-process',
                      label: globalConfig.SHOW_THOUGH_PROCESS_BUTTON_LABEL_TEXT,
                      svgIcon: iconLightBulb,
                      isDisabled: this.isShowingThoughtProcess || !this.canShowThoughtProcess,
                    },
                  ] as any}"
                  .isDisabled="${this.isDisabled}"
                  .isProcessingResponse="${this.isProcessingResponse}"
                  @on-action-button-click="${this.handleChatEntryActionButtonClick}"
                  @on-citation-click="${this.handleCitationClick}"
                  @on-followup-click="${this.handleQuestionInputClick}"
                >
                </chat-thread-component>
              `
            : ''}
          ${this.isAwaitingResponse && !this.hasAPIError
            ? html`<loading-indicator label="${globalConfig.LOADING_INDICATOR_TEXT}"></loading-indicator>`
            : ''}
          <!-- Teaser List with Default Prompts -->
          <div class="chat__container">
            <!-- Conditionally render default prompts based on isDefaultPromptsEnabled -->
            ${this.isDefaultPromptsEnabled
              ? html`
                  <teaser-list-component
                    @teaser-click="${this.handleQuestionInputClick}"
                    .interactionModel="${this.interactionModel}"
                  ></teaser-list-component>
                `
              : ''}
          </div>
          <form
            id="chat-form"
            class="form__container ${this.inputPosition === 'sticky' ? 'form__container-sticky' : ''}"
          >
            <div class="chatbox__container container-col container-row">
              <div class="chatbox__input-container display-flex-grow container-row">
                <input
                  class="chatbox__input display-flex-grow"
                  data-testid="question-input"
                  id="question-input"
                  placeholder="${globalConfig.CHAT_INPUT_PLACEHOLDER}"
                  aria-labelledby="chatbox-label"
                  id="chatbox"
                  name="chatbox"
                  type="text"
                  :value=""
                  ?disabled="${this.isDisabled}"
                  autocomplete="off"
                  @keyup="${this.handleOnInputChange}"
                />
                ${this.isResetInput ? '' : html`<voice-input-button @on-voice-input="${this.handleVoiceInput}" />`}
              </div>
              ${this.renderChatOrCancelButton()}
              <button
                title="${globalConfig.RESET_BUTTON_TITLE_TEXT}"
                class="chatbox__button--reset"
                .hidden="${!this.isResetInput}"
                type="reset"
                id="resetBtn"
                title="Clear input"
                @click="${this.resetInputField}"
              >
                ${globalConfig.RESET_BUTTON_LABEL_TEXT}
              </button>
            </div>

            ${this.isDefaultPromptsEnabled
              ? ''
              : html`<div class="chat__containerFooter">
                  <button type="button" @click="${this.showDefaultPrompts}" class="defaults__span button">
                    ${globalConfig.DISPLAY_DEFAULT_PROMPTS_BUTTON}
                  </button>
                </div>`}
          </form>
        </section>
        ${this.isShowingThoughtProcess
          ? html`
              <aside class="aside" data-testid="aside-thought-process">
                <div class="aside__header">
                  <chat-action-button
                    .label="${globalConfig.HIDE_THOUGH_PROCESS_BUTTON_LABEL_TEXT}"
                    actionId="chat-hide-thought-process"
                    @click="${this.collapseAside}"
                    .svgIcon="${iconClose}"
                  >
                  </chat-action-button>
                </div>
                <tab-component
                  .tabs="${[
                    {
                      id: 'tab-thought-process',
                      label: globalConfig.THOUGHT_PROCESS_LABEL,
                    },
                    {
                      id: 'tab-support-context',
                      label: globalConfig.SUPPORT_CONTEXT_LABEL,
                    },
                    {
                      id: 'tab-citations',
                      label: globalConfig.CITATIONS_TAB_LABEL,
                    },
                  ] as TabContent[]}"
                  .selectedTabId="${this.selectedAsideTab}"
                >
                  <div slot="tab-thought-process">
                    <h3 class="subheadline--small">${globalConfig.THOUGHT_PROCESS_LABEL}</h3>
                    <div class="tab-component__innerContainer">
                      ${this.chatThoughts
                        ? html` <p class="tab-component__paragraph">${unsafeHTML(this.chatThoughts)}</p> `
                        : ''}
                    </div>
                  </div>
                  <div slot="tab-support-context">
                    <h3 class="subheadline--small">${globalConfig.SUPPORT_CONTEXT_LABEL}</h3>
                    <ul class="defaults__list always-row">
                      ${this.chatDataPoints?.map(
                        (dataPoint) => html` <li class="defaults__listItem">${dataPoint}</li> `,
                      )}
                    </ul>
                  </div>
                  <div slot="tab-citations" class="tab-component__content">
                    <citation-list
                      .citations="${this.chatThread.at(-1)?.citations}"
                      .label="${globalConfig.CITATIONS_LABEL}"
                      @on-citation-click="${this.handleCitationClick}"
                    ></citation-list>
                    ${this.selectedCitation
                      ? html`<document-previewer
                          url="${this.apiUrl}/content/${this.selectedCitation.text}"
                        ></document-previewer>`
                      : ''}
                  </div>
                </tab-component>
              </aside>
            `
          : ''}
      </section>
    `;
  }
}
