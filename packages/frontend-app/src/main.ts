/* eslint-disable unicorn/template-indent */
import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { globalConfig } from './config/global-config.js';

// For simplicity, we declare a simple interface for the chat messages
// in the same file. You may want to move this to a separate file, or
// together with existing interfaces in your app.
declare interface ChatMessage {
  text: string;
  isUserMessage: boolean;
  timestamp: string;
}
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
  @property({ type: String }) currentQuestion = '';
  @query('#question-input') questionInput!: HTMLInputElement;
  // Default prompts to display in the chat
  @property({ type: Boolean }) isDisabled = false;
  @property({ type: Boolean }) isChatStarted = false;
  @property({ type: Boolean }) isResetInput = false;
  // The program is awaiting response from API
  @property({ type: Boolean }) isAwaitingResponse = false;
  // Show error message to the end-user, if API call fails
  @property({ type: Boolean }) hasAPIError = false;
  // These are the chat bubbles that will be displayed in the chat
  chatMessages: ChatMessage[] = [];
  hasDefaultPromptsEnabled: boolean = globalConfig.IS_DEFAULT_PROMPTS_ENABLED && !this.isChatStarted;
  defaultPrompts: string[] = globalConfig.DEFAULT_PROMPTS;
  defaultPromptsHeading: string = globalConfig.DEFAULT_PROMPTS_HEADING;
  chatButtonLabelText: string = globalConfig.CHAT_BUTTON_LABEL_TEXT;
  chatInputLabelText: string = globalConfig.CHAT_INPUT_LABEL_TEXT;

  static override styles = css`
    :host {
      display: block;
      padding: 16px;
      --secondary-color: #f8fffd;
      --text-color: #123f58;
      --primary-color: rgba(51, 40, 56, 0.6);
      --white: #fff;
      --accent-high: #8cdef2;
      --accent-dark: #002b23;
      --accent-light: #e6fbf7;
      --error-color: #8a0000;
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
    .chat__container {
      min-width: 100%;
    }
    .chat__header {
      display: flex;
      justify-content: flex-end;
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
      background-color: var(--primary-color);
      color: var(--white);
      border-radius: 10px;
      margin-top: 8px;
      padding: 20px;
      word-wrap: break-word;
      margin-block-end: 0;
      position: relative;
      display: flex;
    }
    .chat__txt.error {
      background-color: var(--error-color);
      color: var(--white);
    }
    .chat__txt.user-message {
      background-color: var(--accent-high);
      color: var(--text-color);
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
      background-color: var(--primary-color);
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
  async sendQuestionToAPI(question: string) {
    // Simulate an API call (replace with actual API endpoint)
    if (this.currentQuestion.trim() === '') {
      return;
    }

    // Empty the current messages to start a new chat
    // TODO: add a button to start a new chat
    // TODO: add chat history (first locally with local storage, then with a backend database)
    this.chatMessages = [];
    // Add the question to the chat
    this.addMessage(question, true);
    // Remove default prompts
    this.isChatStarted = true;
    this.hasDefaultPromptsEnabled = false;
    // Disable the input field and submit button while waiting for the API response
    this.isDisabled = true;
    // Show loading indicator while waiting for the API response
    this.isAwaitingResponse = true;
    try {
      await fetch(`${globalConfig.API_CHAT_URL}`, {
        method: 'POST',
        body: JSON.stringify({
          history: [
            {
              user: this.currentQuestion,
            },
          ],
          // TODO: move this to global config when it's actually implemented
          // as configurable
          approach: 'rrr',
          overrides: {
            retrieval_mode: 'hybrid',
            semantic_ranker: true,
            semantic_captions: false,
            top: 3,
            suggest_followup_questions: false,
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            this.handleAPIError();
            throw new Error(response.statusText);
          }
          const data = response.json();
          return data;
        })
        .then((data) => {
          // Add the response to the chat messages
          this.addMessage(data.answer, false);
        });
      // Enable the input field and submit button again
      this.isDisabled = false;
      this.isAwaitingResponse = false;
    } catch (error) {
      console.error('API Response Exception. Error:', error);
    }
  }

  // Add a message to the chat, when the user or the API sends a message
  addMessage(message: string, isUserMessage: boolean) {
    const timestamp = this.getTimestamp();
    this.chatMessages = [
      ...this.chatMessages,
      {
        text: message,
        timestamp: timestamp,
        isUserMessage,
      },
    ];
    this.requestUpdate();
  }

  // Handle the click on a default prompt
  handleDefaultQuestionClick(question: string, event?: Event) {
    event?.preventDefault();
    this.questionInput.value = question;
    this.currentQuestion = question;
  }

  // Handle the click on the chat button and send the question to the API
  handleUserQuestionSubmit(event: Event) {
    event.preventDefault();
    const userQuestion = this.questionInput.value;
    if (userQuestion) {
      this.currentQuestion = userQuestion;
      this.sendQuestionToAPI(userQuestion);
      this.questionInput.value = '';
      this.isResetInput = false;
    }
  }

  // Get the current timestamp to display with the chat message
  getTimestamp() {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  }

  // Reset the input field and the current question
  resetInputField(event: Event) {
    event.preventDefault();
    this.questionInput.value = '';
    this.currentQuestion = '';
    this.isResetInput = false;
  }

  // Reset the chat and show the default prompts
  resetCurrentChat() {
    this.isChatStarted = false;
    this.chatMessages = [];
    this.hasDefaultPromptsEnabled = true;
  }

  // Show the default prompts when enabled
  showDefaultPrompts() {
    if (!this.hasDefaultPromptsEnabled) {
      this.resetCurrentChat();
    }
  }

  // Handle the change event on the input field
  handleOnInputChange() {
    this.isResetInput = !!this.questionInput.value;
  }

  // Handle API error
  handleAPIError() {
    this.hasAPIError = true;
  }

  // Copy response to clipboard
  copyResponseToClipboard() {
    const response = this.chatMessages[this.chatMessages.length - 1].text;
    navigator.clipboard.writeText(response);
  }

  // Render the chat component as a web component
  override render() {
    return html`
      <section class="chat__container" id="chat-container">
        ${this.isChatStarted
          ? html`
              <div class="chat__header">
                <button
                  title="${globalConfig.RESET_BUTTON_TITLE_TEXT}"
                  class="button"
                  @click="${this.resetCurrentChat}"
                >
                  <img src="./public/svg/delete-icon.svg" alt="Restart Chat" width="20" height="30" />
                </button>
              </div>
              <ul class="chat__list" aria-live="assertive">
                ${this.chatMessages.map(
                  (message) => html`
                    <li class="chat__listItem ${message.isUserMessage ? 'user-message' : ''}">
                      <p class="chat__txt ${message.isUserMessage ? 'user-message' : ''}">${message.text}</p>
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
                            @click="${(event: Event) => this.handleDefaultQuestionClick(prompt, event)}"
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
              autocomplete="off"
              @keyup="${this.handleOnInputChange}"
            />
            <button
              class="chatbox__button"
              @click="${this.handleUserQuestionSubmit}"
              title="${globalConfig.CHAT_BUTTON_LABEL_TEXT}"
            >
              ${globalConfig.CHAT_BUTTON_LABEL_TEXT}
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
