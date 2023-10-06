/* eslint-disable unicorn/template-indent */
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { chatHttpOptions, globalConfig, requestOptions } from './config/global-config.js';
import { getAPIResponse } from './core/http/index.js';
import { parseStreamedMessages } from './core/parser/index.js';
import { mainStyle } from './style.js';
import { getTimestamp, processText } from './utils/index.js';
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
  chatThread: ChatThreadEntry[] = [];
  hasDefaultPromptsEnabled: boolean = globalConfig.IS_DEFAULT_PROMPTS_ENABLED && !this.isChatStarted;
  defaultPrompts: string[] = globalConfig.DEFAULT_PROMPTS;
  defaultPromptsHeading: string = globalConfig.DEFAULT_PROMPTS_HEADING;
  chatButtonLabelText: string = globalConfig.CHAT_BUTTON_LABEL_TEXT;
  chatInputLabelText: string = globalConfig.CHAT_INPUT_LABEL_TEXT;

  chatRequestOptions: ChatRequestOptions = requestOptions;
  chatHttpOptions: ChatHttpOptions = chatHttpOptions;

  static override styles = [mainStyle];

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

        await parseStreamedMessages({
          chatThread: this.chatThread,
          apiResponseBody: (this.apiResponse as Response).body,
          visit: () => {
            // NOTE: this function is called whenever we mutate sub-properties of the array
            this.requestUpdate('chatThread');
          },
        });
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
      if (this.isStreaming) {
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
    const question = this.questionInput.value;
    if (question) {
      this.currentQuestion = question;
      try {
        this.isStreaming = type === 'chat' && this.chatHttpOptions.stream;
        // Remove default prompts
        this.isChatStarted = true;
        this.hasDefaultPromptsEnabled = false;
        // Disable the input field and submit button while waiting for the API response
        this.isDisabled = true;
        // Show loading indicator while waiting for the API response
        this.processApiResponse({ message: question, isUserMessage: true });

        this.isAwaitingResponse = true;
        this.apiResponse = await getAPIResponse({ ...this.chatRequestOptions, question, type }, this.chatHttpOptions);

        this.questionInput.value = '';
        this.isAwaitingResponse = false;
        this.isDisabled = false;
        this.isResetInput = false;

        const response = this.apiResponse as BotResponse;
        const message: string = response.answer;
        await this.processApiResponse({ message, isUserMessage: false });
      } catch (error) {
        console.error(error);
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
  resetCurrentChat(): void {
    this.isChatStarted = false;
    this.chatThread = [];
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
    const response = this.chatThread.at(-1)?.text.at(-1)?.value as string;
    navigator.clipboard.writeText(response);
    this.isResponseCopied = true;
  }

  renderTextEntry(textEntry: ChatMessageText) {
    const entries = [html`<p>${unsafeHTML(textEntry.value)}</p>`];

    // render steps
    if (textEntry.followingSteps && textEntry.followingSteps.length > 0) {
      entries.push(
        html` <ol class="items__list steps">
          ${textEntry.followingSteps.map(
            (followingStep) => html` <li class="items__listItem--step">${unsafeHTML(followingStep)}</li> `,
          )}
        </ol>`,
      );
    }

    return entries;
  }

  renderCitation(citations: Citation[] | undefined) {
    // render citations
    if (citations && citations.length > 0) {
      return html`
        <h3 class="subheadline--small">Citations</h3>
        <ol class="items__list">
          ${citations.map(
            (citation) => html`
              <li class="items__listItem--citation">
                <a class="items__link" href="${citation.text}" target="_blank" rel="noopener noreferrer"
                  >${citation.ref}. ${citation.text}</a
                >
              </li>
            `,
          )}
        </ol>
      `;
    }

    return '';
  }

  renderFollowupQuestions(followupQuestions: string[] | undefined) {
    if (followupQuestions && followupQuestions.length > 0) {
      return html`
        <h3 class="subheadline--small">You may also want to ask...</h3>
        <ol class="items__list followup">
          ${followupQuestions.map(
            (followupQuestion) => html`
              <li class="items__listItem--followup">
                <a
                  class="items__link"
                  href="#"
                  @click="${(event: Event) => this.handleDefaultPromptClick(followupQuestion, event)}"
                  >${followupQuestion}</a
                >
              </li>
            `,
          )}
        </ol>
      `;
    }

    return '';
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
                ${this.chatThread.map(
                  (message) => html`
                    <li class="chat__listItem ${message.isUserMessage ? 'user-message' : ''}">
                      <div class="chat__txt ${message.isUserMessage ? 'user-message' : ''}">
                        ${message.text.map((textEntry) => this.renderTextEntry(textEntry))}
                        ${this.renderFollowupQuestions(message.followupQuestions)}
                        ${this.renderCitation(message.citations)}
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
                <button type="button" @click="${this.showDefaultPrompts}" class="defaults__span button">
                  ${globalConfig.DISPLAY_DEFAULT_PROMPTS_BUTTON}
                </button>
              `}
        </div>
      </section>
    `;
  }
}
