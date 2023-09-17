import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { globalConfig } from './config/global-config.js';

declare interface ChatMessage {
  text: string;
  isUserMessage: boolean;
  timestamp: string;
}
/**
 * A chat component that allows the user to ask questions and get answers from an API.
 * The component also displays default prompts that the user can click on to ask a question.
 * The component is built with LitElement and Material Web Components.
 *
 * Labels and other aspects are configurable via properties that get their values from the global config file.
 * @element chat-component
 * @fires chat-component#questionSubmitted - Fired when the user submits a question
 * @fires chat-component#defaultQuestionClicked - Fired when the user clicks on a default question
 * */

@customElement('chat-component')
export class ChatComponent extends LitElement {
  @property({ type: String }) currentQuestion = '';
  @query('#questionInput') questionInput!: HTMLInputElement;
  // Default prompts to display in the chat
  @property({ type: Boolean }) isDisabled = false;
  @property({ type: Boolean }) isChatStarted = false;
  @property({ type: Boolean }) isResetInput = false;
  showDefaultPrompts: boolean = globalConfig.IS_DEFAULT_PROMPTS_ENABLED && !this.isChatStarted;
  defaultPrompts: string[] = globalConfig.DEFAULT_PROMPTS;
  defaultPromptsHeading: string = globalConfig.DEFAULT_PROMPTS_HEADING;
  // Awaiting response from API
  @property({ type: Boolean }) isAwaitingResponse = false;
  // This are the chat bubbles that will be displayed in the chat
  chatMessages: ChatMessage[] = [];
  // This are the labels for the chat button and input
  chatButtonLabelText: string = globalConfig.CHAT_BUTTON_LABEL_TEXT;
  chatInputLabelText: string = globalConfig.CHAT_INPUT_LABEL_TEXT;
  // Show error message if API call fails
  @property({ type: Boolean }) hasAPIError = false;

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
    }

    #chat-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 100%;
    }

    #chat-container form {
      display: flex;
      flex-direction: column;
    }

    .chatboxAction {
      display: flex;
      flex-direction: row;
      position: relative;
      height: 50px;
    }

    .chatboxAction button {
      background: var(--accent-high);
      border: none;
      color: var(--text-color);
      font-weight: bold;
      cursor: pointer;
      border-radius: 4px;
      margin-left: 8px;
    }

    .chatboxAction [type='reset'] {
      position: absolute;
      right: 100px;
      top: 10px;
      background: transparent;
      border: none;
      color: gray;
    }

    .chatboxAction input {
      border: 1px solid var(--accent-high);
      border-radius: 4px;
      padding: 8px;
      flex: 1 1 auto;
      font-size: 1rem;
    }

    .chat-container__subHl {
      color: var(--text-color);
      font-size: 1.2rem;
      padding: 0;
      margin: 0;
    }

    .chat-container__messages {
      color: var(--text-color);
      display: flex;
      flex-direction: column;
      padding: 0;
      margin-bottom: 50px;
    }

    .message-bubble {
      max-width: 80%;
      min-width: 70%;
      display: flex;
      flex-direction: column;
      height: auto;
    }

    .message-bubble-txt {
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

    .message-bubble-txt.user-message {
      background-color: var(--accent-high);
      color: var(--text-color);
    }

    .message-bubble.user-message {
      align-self: flex-end;
    }

    .message-info {
      font-size: smaller;
      font-style: italic;
      margin: 0;
      margin-top: 1px;
    }

    .user-message .message-info {
      text-align: right;
    }

    .defaultPrompts-container {
      display: flex;
      flex-direction: column;
    }

    .defaultPrompts-button {
      text-decoration: none;
      color: var(--text-color);
      display: block;
    }

    .defaultPrompts-container ul {
      list-style-type: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      text-align: center;

      @media (min-width: 1200px) {
        flex-direction: row;
      }
    }

    .defaultPrompts-container ul li {
      padding: 10px;
      border-radius: 10px;
      border: 1px solid var(--accent-high);
      background: var(--secondary-color);
      margin: 4px;
      color: var(--text-color);
      display: flex;
      flex-direction: column;
      display: flex;
      justify-content: space-evenly;

      @media (min-width: 768px) {
        min-height: 100px;
      }
    }

    .defaultPrompts-container ul li:hover,
    .defaultPrompts-container ul li:focus {
      color: var(--accent-dark);
      background: var(--accent-light);
      transition: all 0.3s ease-in-out;
    }

    .defaultPrompts-cta {
      font-weight: bold;
      display: block;
      margin-top: 20px;
      text-decoration: underline;
    }

    .defaultPrompts-container ul li button {
      border: none;
      background: transparent;
      color: var(--text-color);
    }

    .defaultPrompts-cta {
      font-weight: bold;
      display: block;
      margin-top: 20px;
    }

    .loading-skeleton {
      display: flex;
      margin-bottom: 50px;
    }

    .circle {
      width: 10px;
      height: 10px;
      margin: 0 5px;
      background-color: var(--primary-color);
      border-radius: 50%;
      animation: chatloadinganimation 1.5s infinite;
    }

    .circle:nth-child(2) {
      animation-delay: 0.5s;
    }

    .circle:nth-child(3) {
      animation-delay: 1s;
    }
  `;

  // Send the question to the Open AI API and render the answer in the chat
  async sendQuestionToAPI(question: string) {
    // Simulate an API call (replace with actual API endpoint)
    if (this.currentQuestion.trim() === '') {
      return;
    }

    // empty the current messages
    this.chatMessages = [];
    // add the question to the chat
    this.addMessage(question, true);
    // remove default prompts
    this.isChatStarted = true;
    this.showDefaultPrompts = false;
    // disable the input field and submit button while waiting for the API response
    this.isDisabled = true;
    // show loading indicator
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
          // add the response to the chat
          this.addMessage(data.answer, false);
        });
      // enable the input field and submit button again
      this.isDisabled = false;
      this.isAwaitingResponse = false;
    } catch (error) {
      this.handleAPIError();
      console.error('API Response Exception. Error:', error);
    }
  }

  // add a message to the chat, when the user or the API sends a message
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

  // handle the click on a default prompt
  handleDefaultQuestionClick(question: string, event?: Event) {
    event?.preventDefault();
    this.questionInput.value = question;
    this.currentQuestion = question;
  }

  // Handle the click on the chat button and send the question to the API
  handleUserQuestionSubmit(event: Event) {
    event.preventDefault();
    console.log('User question:', this.questionInput.value);
    const userQuestion = this.questionInput.value;
    if (userQuestion) {
      this.currentQuestion = userQuestion;
      this.sendQuestionToAPI(userQuestion);
      this.questionInput.value = '';
      this.isResetInput = false;
    }
  }

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

  displayDefaultPrompts() {
    if (!this.showDefaultPrompts) {
      this.isChatStarted = false;
      this.chatMessages = [];
      this.showDefaultPrompts = true;
    }
  }

  handleOnInputChange() {
    this.isResetInput = !!this.questionInput.value;
  }

  handleAPIError() {
    console.log('API Error');
    this.hasAPIError = true;
  }

  // Web Component render function
  override render() {
    return html`
      <div id="chat-container">
        <ul class="chat-container__messages" aria-live="assertive">
          ${this.chatMessages.map(
            (message) => html`
              <li class="message-bubble ${message.isUserMessage ? 'user-message' : ''}">
                <p class="message-bubble-txt ${message.isUserMessage ? 'user-message' : ''}">${message.text}</p>
                <p class="message-info">
                  <span class="timestamp">${message.timestamp}</span>,
                  <span class="user">${message.isUserMessage ? 'You' : globalConfig.USER_IS_BOT}</span>
                </p>
              </li>
            `,
          )}
          ${
            this.hasAPIError
              ? html`
                <li class="message-bubble user-message">
                  <p class="message-bubble-txt user-message">${globalConfig.API_ERROR_MESSAGE}</p>
                </li>
              `
              : ''
          }
        </ul>
        ${
          this.isAwaitingResponse
            ? html`
              <div
                id="loading-indicator"
                class="loading-skeleton"
                aria-label="${globalConfig.LOADING_INDICATOR_TEXT}"
              >
                <div class="circle"></div>
                <div class="circle"></div>
                <div class="circle"></div>
              </div>
            `
            : ''
        }
        <!-- Default prompts: use the variables above to edit the heading -->
        <div class="chat-container__questions">
          <!-- Conditionally render default prompts based on showDefaultPrompts -->
          ${
            this.showDefaultPrompts
              ? html`
                <div class="defaultPrompts-container">
                  <h2 class="chat-container__subHl">${this.defaultPromptsHeading}</h3>
                  <ul>
                    ${this.defaultPrompts.map(
                      (prompt) => html`
                        <li>
                          <a
                            role="button"
                            href="#"
                            class="defaultPrompts-button"
                            @click="${(event: Event) => this.handleDefaultQuestionClick(prompt, event)}"
                          >
                            ${prompt}
                            <span class="defaultPrompts-cta">Ask now</span>
                          </a>
                        </li>
                      `,
                    )}
                  </ul>
                </div>
              `
              : ''
          }
        </div>
        </section>
        <form>
          <label id="chatboxLabel" for="questionInput">${globalConfig.CHAT_INPUT_LABEL_TEXT}</label>

          <div class="chatboxAction">
            <input id="questionInput" placeholder="${
              globalConfig.CHAT_INPUT_PLACEHOLDER
            }" aria-labelledby="chatboxLabel" id="chatbox" name="chatbox" type="text" :value="" autocomplete="off" @keyup="${
              this.handleOnInputChange
            }">
            <button @click="${this.handleUserQuestionSubmit}" title="${globalConfig.CHAT_BUTTON_LABEL_TEXT}">${
              globalConfig.CHAT_BUTTON_LABEL_TEXT
            }</button>
            <button .hidden="${!this.isResetInput}" type="reset" id="resetBtn" title="Clear input" @click="${
              this.resetInputField
            }" title="${globalConfig.RESET_BUTTON_LABEL_TEXT}">${globalConfig.RESET_BUTTON_LABEL_TEXT}</button>
          </div>
        </form>
        <div class="chat-container__footer">
        ${
          this.showDefaultPrompts
            ? ''
            : html`
              <button class="button" type="button" @click="${this.displayDefaultPrompts}" class="defaultPrompts-cta">
                ${globalConfig.DISPLAY_DEFAULT_PROMPTS_BUTTON}
              </button>
            `
        }
        </div>
      </section>
      </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chat-component': ChatComponent;
  }
}
