/* eslint-disable unicorn/template-indent */
import { LitElement, html, css } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';
import { globalConfig, requestOptions } from './config/global-config.js';
import { processText } from './utils/index.ts';
import { EventSourceParserStream } from 'eventsource-parser/stream';
import type { BotResponse, ChatMessage, Citation, RequestOptions } from './types';
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
  @property({ type: String })
  currentQuestion = '';
  @query('#question-input')
  questionInput!: HTMLInputElement;
  // Default prompts to display in the chat
  @property({ type: Boolean })
  isDisabled = false;
  @property({ type: Boolean })
  isChatStarted = false;
  @property({ type: Boolean })
  isResetInput = false;
  // The program is awaiting response from API
  @property({ type: Boolean })
  isAwaitingResponse = false;
  // Show error message to the end-user, if API call fails
  @property({ type: Boolean })
  hasAPIError = false;
  // Has the response been copied to the clipboard
  @property({ type: Boolean })
  isResponseCopied = false;
  @property({ type: Boolean })
  isStreaming = false;
  // api response
  apiResponse = {} as BotResponse | Response;
  // These are the chat bubbles that will be displayed in the chat
  chatMessages: ChatMessage[] = [];
  hasDefaultPromptsEnabled: boolean = globalConfig.IS_DEFAULT_PROMPTS_ENABLED && !this.isChatStarted;
  defaultPrompts: string[] = globalConfig.DEFAULT_PROMPTS;
  defaultPromptsHeading: string = globalConfig.DEFAULT_PROMPTS_HEADING;
  chatButtonLabelText: string = globalConfig.CHAT_BUTTON_LABEL_TEXT;
  chatInputLabelText: string = globalConfig.CHAT_INPUT_LABEL_TEXT;

  requestOptions: RequestOptions = requestOptions;

  static override styles = css`
    :host {
      display: block;
      padding: 16px;
      --secondary-color: #f8fffd;
      --text-color: #123f58;
      --primary-color: rgba(241, 255, 165, 0.6);
      --white: #fff;
      --light-gray: #e3e3e3;
      --dark-gray: #4e5288;
      --accent-high: #8cdef2;
      --accent-dark: #002b23;
      --accent-light: #e6fbf7;
      --accent-lighter: rgba(140, 222, 242, 0.4);
      --error-color: #8a0000;
    }
    :host(.dark) {
      display: block;
      padding: 16px;
      --secondary-color: #1f2e32;
      --text-color: #ffffff;
      --primary-color: rgba(241, 255, 165, 0.6);
      --white: #000000;
      --light-gray: #e3e3e3;
      --dark-gray: #4e5288;
      --accent-high: #005164;
      --accent-dark: #b4e2ee;
      --accent-light: #e6fbf7;
      --accent-lighter: rgba(140, 222, 242, 0.4);
      --error-color: #8a0000;
    }
    ul {
      margin-block-start: 0;
      margin-block-end: 0;
    }
    .button {
      color: var(--text-color);
      border: 0;
      background: none;
      cursor: pointer;
      text-decoration: underline;
    }
    @keyframes chatmessageanimation {
      0% {
        opacity: 0.5;
        top: 150px;
      }
      100% {
        opacity: 1;
        top: 0px;
      }
    }
    @keyframes chatloadinganimation {
      0% {
        opacity: 0.5;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0.5;
      }
    }
    .display-none {
      display: none;
      visibility: hidden;
    }
    .display-flex {
      display: flex;
    }
    .container-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .container-row {
      flex-direction: row;
    }
    .headline {
      color: var(--text-color);
      font-size: 1.5rem;
      padding: 0;
      margin: 0;
    }
    .subheadline {
      color: var(--text-color);
      font-size: 1.2rem;
      padding: 0;
      margin: 0;
    }
    .subheadline--small {
      font-size: 12px;
      text-transform: uppercase;
      text-decoration: underline;
    }
    .chat__container {
      min-width: 100%;
    }
    .chat__header {
      display: flex;
      justify-content: flex-end;
    }
    .chat__header--button {
      border: 1px solid var(--accent-dark);
      text-decoration: none;
      border-radius: 5px;
      background: var(--white);
      display: flex;
      align-items: center;
      margin-left: 5px;
      opacity: 1;
      padding: 5px;
      transition: all 0.3s ease-in-out;
    }
    .chat__header--button:disabled,
    .chatbox__button:disabled,
    .chatbox__input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .chat__header--span {
      margin-right: 5px;
    }
    .chatbox__container {
      position: relative;
      height: 50px;
    }
    .chatbox__button {
      background: var(--accent-high);
      border: none;
      color: var(--text-color);
      font-weight: bold;
      cursor: pointer;
      border-radius: 4px;
      margin-left: 8px;
      width: 80px;
    }
    .chatbox__button--reset {
      position: absolute;
      right: 115px;
      top: 15px;
      background: transparent;
      border: none;
      color: gray;
      background: var(--accent-dark);
      border-radius: 50%;
      color: var(--white);
      font-weight: bold;
      height: 20px;
      width: 20px;
      cursor: pointer;
    }
    .chatbox__input {
      border: 1px solid var(--accent-high);
      background: var(--white);
      color: var(--text-color);
      border-radius: 4px;
      padding: 8px;
      flex: 1 1 auto;
      font-size: 1rem;
    }
    .chat__list {
      color: var(--text-color);
      display: flex;
      flex-direction: column;
      padding: 0;
      margin-bottom: 50px;
    }
    .chat__listItem {
      max-width: 80%;
      min-width: 70%;
      display: flex;
      flex-direction: column;
      height: auto;
    }
    .chat__txt {
      animation: chatmessageanimation 0.5s ease-in-out;
      background-color: var(--secondary-color);
      color: var(--text-color);
      border-radius: 10px;
      margin-top: 8px;
      padding: 20px;
      word-wrap: break-word;
      margin-block-end: 0;
      position: relative;
    }
    .chat__txt.error {
      background-color: var(--error-color);
      color: var(--white);
    }
    .chat__txt.user-message {
      background-color: var(--accent-high);
    }
    .chat__listItem.user-message {
      align-self: flex-end;
    }
    .chat__txt--info {
      font-size: smaller;
      font-style: italic;
      margin: 0;
      margin-top: 1px;
    }
    .user-message .chat__txt--info {
      text-align: right;
    }
    .items__list.followup {
      display: flex;
      flex-direction: column;
      padding: 20px;
    }
    .items__list.steps {
      display: block;
    }
    .items__listItem--followup {
      cursor: pointer;
      color: var(--dark-gray);
    }
    .items__listItem--citation {
      display: inline-block;
      background-color: var(--accent-lighter);
      border-radius: 5px;
      text-decoration: none;
      padding: 5px;
      font-size: small;
    }
    .items__listItem--citation:not(first-child) {
      margin-left: 5px;
    }
    .items__link {
      text-decoration: none;
      color: var(--text-color);
    }
    .steps .items__listItem--step {
      padding: 5px 0;
      border-bottom: 1px solid var(--light-gray);
    }
    .followup .items__link {
      color: var(--dark-gray);
      display: block;
      padding: 5px 0;
      border-bottom: 1px solid var(--light-gray);
    }
    .defaults__button {
      text-decoration: none;
      color: var(--text-color);
      display: block;
    }
    .defaults__list {
      list-style-type: none;
      padding: 0;
      text-align: center;
      display: flex;
      flex-direction: column;

      @media (min-width: 1200px) {
        flex-direction: row;
      }
    }
    .defaults__listItem {
      padding: 10px;
      border-radius: 10px;
      border: 1px solid var(--accent-high);
      background: var(--secondary-color);
      margin: 4px;
      color: var(--text-color);
      justify-content: space-evenly;

      @media (min-width: 768px) {
        min-height: 100px;
      }
    }
    .defaults__listItem:hover,
    .defaults__listItem:focus {
      color: var(--accent-dark);
      background: var(--accent-light);
      transition: all 0.3s ease-in-out;
    }
    .defaults__span {
      font-weight: bold;
      display: block;
      margin-top: 20px;
      text-decoration: underline;
    }
    .loading-skeleton {
      display: flex;
      margin-bottom: 50px;
    }
    .dot {
      width: 10px;
      height: 10px;
      margin: 0 5px;
      background-color: var(--accent-high);
      border-radius: 50%;
      animation: chatloadinganimation 1.5s infinite;
    }
    .dot:nth-child(2) {
      animation-delay: 0.5s;
    }
    .dot:nth-child(3) {
      animation-delay: 1s;
    }
  `;

  // Send the question to the Open AI API and render the answer in the chat
  async getAPIResponse(question: string, options: RequestOptions, type: string): Promise<BotResponse | Response> {
    this.isStreaming = type === 'chat' && options.stream;
    // Add the question to the chat
    this.addMessage(question, true);
    // Remove default prompts
    this.isChatStarted = true;
    this.hasDefaultPromptsEnabled = false;
    // Disable the input field and submit button while waiting for the API response
    this.isDisabled = true;
    // Show loading indicator while waiting for the API response
    this.isAwaitingResponse = true;
    const response = await fetch(`${globalConfig.API_URL}${type}`, {
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // must enable history persistence
        history: [
          {
            user: this.currentQuestion,
          },
        ],
        approach: options.approach,
        overrides: options.overrides,
        stream: this.isStreaming,
      }),
    });

    if (this.isStreaming) {
      return response;
    }

    const parsedResponse: BotResponse = await response.json();
    if (response.status > 299 || !response.ok) {
      this.handleAPIError();
      throw new Error(response.statusText) || 'API Response Error';
    }
    return parsedResponse;
  }

  readStream = async function* <T>(response: Response): AsyncGenerator<T, void> {
    const reader: any = response.body
      ?.pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream())
      .getReader();

    if (!reader) {
      throw new Error('No response body or body is not readable');
    }

    for (;;) {
      const { done, value } = await reader.read();
      if (done || value?.data === 'Stream closed') {
        break;
      }
      if (value?.data) {
        yield new Promise<T>((resolve /*, reject*/) => {
          setTimeout(() => {
            resolve(JSON.parse(value.data));
          }, globalConfig.BOT_TYPING_EFFECT_INTERVAL);
        });
      }
    }
  };

  // TODO: refactor this function to support streaming
  processStreamedResponse(chunk: string, { citations, followingSteps, followupQuestions }) {
    const processedText = processText(chunk, [citations, followingSteps, followupQuestions]);
    chunk = processedText.replacedText;
    // Push all lists coming from processText to the corresponding arrays
    citations.push(...(processedText.arrays[0] as unknown as Citation[]));
    followingSteps.push(...(processedText.arrays[1] as string[]));
    followupQuestions.push(...(processedText.arrays[2] as string[]));

    return {
      chunk,
      citations,
      followingSteps,
      followupQuestions,
    };
  }

  async appendTextMessage({ timestamp, isUserMessage }) {
    const chunks = this.getDataChunks<Partial<BotResponse> & { id: string }>(this.apiResponse as Response);
    const userMessage = this.chatMessages;

    // add a new empty message to the chat so that the bot can start typing
    this.chatMessages = [
      ...userMessage,
      {
        text: '',
        timestamp: timestamp,
        isUserMessage,
      },
    ];

    const currentMessage: string[] = [];

    for await (const chunk of chunks) {
      if (chunk.answer) {
        currentMessage.push(chunk.answer);

        // TODO: process the current accumulated text if we detect a closing ] in the chunk
        // if (chunk.answer.includes(']')) { }

        this.chatMessages[this.chatMessages.length - 1].text += chunk.answer;
        this.requestUpdate('chatMessages');
      }
    }

    return true;
  }

  // Add a message to the chat, when the user or the API sends a message
  async addMessage(message: string, isUserMessage: boolean) {
    const citations: Citation[] = [];
    const followingSteps: string[] = [];
    const followupQuestions: string[] = [];
    // Get the timestamp for the message
    const timestamp = this.getTimestamp();
    const updateChatWithMessageOrChunk = async (part: string, isChunk: boolean) => {
      if (isChunk) {
        await this.appendTextMessage({
          timestamp,
          isUserMessage,
        });
        return true;
      }

      this.chatMessages = [
        ...this.chatMessages,
        {
          text: part,
          timestamp: timestamp,
          isUserMessage,
          citations: [...new Set(citations)],
          followupQuestions,
          followingSteps,
        },
      ];
      return true;
    };

    // Check if message is a bot message to process citations and follow-up questions
    if (isUserMessage) {
      updateChatWithMessageOrChunk(message, false);
    } else {
      if (this.isStreaming) {
        await updateChatWithMessageOrChunk(message /* undefined */, true);

        // start processing once the streaming is done
        const lastMessage = this.chatMessages[this.chatMessages.length - 1].text;
        const processedText = processText(lastMessage, [citations, followingSteps, followupQuestions]);
        message = processedText.replacedText;
        citations.push(...(processedText.arrays[0] as unknown as Citation[]));
        followingSteps.push(...(processedText.arrays[1] as string[]));
        followupQuestions.push(...(processedText.arrays[2] as string[]));

        // update last message
        this.chatMessages[this.chatMessages.length - 1] = {
          ...this.chatMessages[this.chatMessages.length - 1],
          text: message,
          citations,
          followupQuestions,
          followingSteps,
        };
        this.requestUpdate('chatMessages');
      } else {
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

  // Handle the click on a default prompt
  handleDefaultPromptClick(question: string, event?: Event): void {
    event?.preventDefault();
    this.questionInput.value = question;
    this.currentQuestion = question;
  }

  // Handle the click on the chat button and send the question to the API
  async handleUserChatSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const type = 'chat';
    const userQuestion = this.questionInput.value;
    if (userQuestion) {
      this.currentQuestion = userQuestion;
      try {
        this.apiResponse = await this.getAPIResponse(userQuestion, this.requestOptions, type);
        console.log(this.apiResponse, 'apiResponse');
        const response = this.apiResponse as BotResponse;
        const message: string = response.answer;
        this.addMessage(message, false);
        this.isDisabled = false;
        this.isAwaitingResponse = false;
        this.questionInput.value = '';
        this.isResetInput = false;
        // eslint-disable-next-line unicorn/prefer-optional-catch-binding
      } catch (error) {
        this.handleAPIError();
      }
    }
  }

  // Get the current timestamp to display with the chat message
  getTimestamp(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  }

  // Reset the input field and the current question
  resetInputField(event: Event): void {
    event.preventDefault();
    this.questionInput.value = '';
    this.currentQuestion = '';
    this.isResetInput = false;
  }

  // Reset the chat and show the default prompts
  resetCurrentChat(): void {
    this.isChatStarted = false;
    this.chatMessages = [];
    this.isDisabled = false;
    this.hasDefaultPromptsEnabled = true;
    this.isResponseCopied = false;
  }

  // Show the default prompts when enabled
  showDefaultPrompts(): void {
    if (!this.hasDefaultPromptsEnabled) {
      this.resetCurrentChat();
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
  }

  // Copy response to clipboard
  copyResponseToClipboard(): void {
    const response = this.chatMessages.at(-1)?.text.at(-1)?.value as string;
    navigator.clipboard.writeText(response);
    this.isResponseCopied = true;
  }

  // Render the chat component as a web component
  override render() {
    return html`
      <section class="chat__container" id="chat-container">
        ${this.isChatStarted
          ? html`
              <div class="chat__header">
                <button
                  title="${globalConfig.RESET_CHAT_BUTTON_TITLE}"
                  class="button chat__header--button"
                  @click="${this.copyResponseToClipboard}"
                  ?disabled="${this.isDisabled}"
                >
                  <span class="chat__header--span"
                    >${this.isResponseCopied
                      ? globalConfig.COPIED_SUCCESSFULLY_MESSAGE
                      : globalConfig.COPY_RESPONSE_BUTTON_LABEL_TEXT}</span
                  >
                  <img
                    src="${this.isResponseCopied ? './public/svg/doublecheck-icon.svg' : './public/svg/copy-icon.svg'}"
                    alt="${globalConfig.COPY_RESPONSE_BUTTON_LABEL_TEXT}"
                    width="12"
                    height="12"
                  />
                </button>
                <button
                  title="${globalConfig.RESET_CHAT_BUTTON_TITLE}"
                  class="button chat__header--button"
                  @click="${this.resetCurrentChat}"
                >
                  <span class="chat__header--span">${globalConfig.RESET_CHAT_BUTTON_TITLE}</span>
                  <img
                    src="./public/svg/delete-icon.svg"
                    alt="${globalConfig.RESET_CHAT_BUTTON_TITLE}"
                    width="12"
                    height="12"
                  />
                </button>
              </div>
              <ul class="chat__list" aria-live="assertive">
                ${this.chatMessages.map(
                  (message) => html`
                    <li class="chat__listItem ${message.isUserMessage ? 'user-message' : ''}">
                      <div class="chat__txt ${message.isUserMessage ? 'user-message' : ''}">
                        <p>${message.text}</p>
                        ${message.followingSteps && message.followingSteps.length > 0
                          ? html`
                              <ul class="items__list steps">
                                ${message.followingSteps.map(
                                  (followingStep) => html` <li class="items__listItem--step">${followingStep}</li> `,
                                )}
                              </ul>
                            `
                          : ''}
                        ${message.citations && message.citations.length > 0
                          ? html`
                              <h3 class="subheadline--small">Citations</h3>
                              <ul class="items__list">
                                ${message.citations.map(
                                  (citation) => html`
                                    <li class="items__listItem--citation">
                                      <a
                                        class="items__link"
                                        href="${citation.text}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        >${citation.ref}. ${citation.text}</a
                                      >
                                    </li>
                                  `,
                                )}
                              </ul>
                            `
                          : ''}
                        ${message.followupQuestions && message.followupQuestions.length > 0
                          ? html`
                              <h3 class="subheadline--small">You may also want to ask...</h3>
                              <ul class="items__list followup">
                                ${message.followupQuestions.map(
                                  (followupQuestion) => html`
                                    <li class="items__listItem--followup">
                                      <a
                                        class="items__link"
                                        href="#"
                                        @click="${(event: Event) =>
                                          this.handleDefaultPromptClick(followupQuestion, event)}"
                                        >${followupQuestion}</a
                                      >
                                    </li>
                                  `,
                                )}
                              </ul>
                            `
                          : ''}
                      </div>
                      <p class="chat__txt--info">
                        <span class="timestamp">${message.timestamp}</span>,
                        <span class="user">${message.isUserMessage ? 'You' : globalConfig.USER_IS_BOT}</span>
                      </p>
                    </li>
                  `,
                )}
                ${this.hasAPIError
                  ? html`
                      <li class="chat__listItem">
                        <p class="chat__txt error">${globalConfig.API_ERROR_MESSAGE}</p>
                      </li>
                    `
                  : ''}
              </ul>
            `
          : ''}
        ${this.isAwaitingResponse && !this.hasAPIError
          ? html`
              <div id="loading-indicator" class="loading-skeleton" aria-label="${globalConfig.LOADING_INDICATOR_TEXT}">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
            `
          : ''}
        <!-- Default prompts: use the variables above to edit the heading -->
        <div class="chat__container">
          <!-- Conditionally render default prompts based on hasDefaultPromptsEnabled -->
          ${this.hasDefaultPromptsEnabled
            ? html`
                <div class="defaults__container">
                  <h2 class="subheadline">${this.defaultPromptsHeading}</h2>
                  <ul class="defaults__list">
                    ${this.defaultPrompts.map(
                      (prompt) => html`
                        <li class="defaults__listItem">
                          <a
                            role="button"
                            href="#"
                            class="defaults__button"
                            @click="${(event: Event) => this.handleDefaultPromptClick(prompt, event)}"
                          >
                            ${prompt}
                            <span class="defaults__span">Ask now</span>
                          </a>
                        </li>
                      `,
                    )}
                  </ul>
                </div>
              `
            : ''}
        </div>
        <form id="chat-form" class="form__container">
          <label id="chatbox-label" for="question-input">${globalConfig.CHAT_INPUT_LABEL_TEXT}</label>

          <div class="chatbox__container container-col container-row">
            <input
              class="chatbox__input"
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
            <button
              class="chatbox__button"
              @click="${this.handleUserChatSubmit}"
              title="${globalConfig.CHAT_BUTTON_LABEL_TEXT}"
              ?disabled="${this.isDisabled}"
            >
              <img
                src="./public/svg/send-icon.svg"
                alt="${globalConfig.CHAT_BUTTON_LABEL_TEXT}"
                width="25"
                height="25"
              />
            </button>
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
        </form>
        <div class="chat__container--footer">
          ${this.hasDefaultPromptsEnabled
            ? ''
            : html`
                <button type="button" @click="${this.showDefaultPrompts}" class="deaults__span button">
                  ${globalConfig.DISPLAY_DEFAULT_PROMPTS_BUTTON}
                </button>
              `}
        </div>
      </section>
    `;
  }
}

// Register the custom element
declare global {
  interface HTMLElementTagNameMap {
    'chat-component': ChatComponent;
  }
}
