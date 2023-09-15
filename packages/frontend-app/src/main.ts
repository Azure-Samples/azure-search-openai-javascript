import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { globalConfig } from './config/globalConfig';

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
  @property({ type: Boolean }) isInputDisabled = false;
  @property({ type: Boolean }) isSubmitButtonDisabled = false;
  @property({ type: Boolean }) isChatStarted = false;
  showDefaultPrompts: boolean = globalConfig.IS_DEFAULT_PROMPTS_ENABLED && !this.isChatStarted;
  defaultPrompts: string[] = globalConfig.DEFAULT_PROMPTS;
  defaultPromptsHeading: string = globalConfig.DEFAULT_PROMPTS_HEADING;
  // This are the chat bubbles that will be displayed in the chat
  chatMessages: ChatMessage[] = [];
  // This are the labels for the chat button and input
  chatButtonLabelText: string = globalConfig.CHAT_BUTTON_LABEL_TEXT;
  chatInputLabelText: string = globalConfig.CHAT_INPUT_LABEL_TEXT;

  static override styles = css`
    :host {
      display: block;
      padding: 16px;
      --background-color: #D9D9D9;
      --text-color: #123F58;
      --bubble-color: rgba(51, 40, 56, 0.6);
      --bubble-text-color: #fff;
      --user-bubble-color: #4BBFAA;
    }

    html,
    body {
      font-family: 'Roboto', sans-serif;
      background-color: var(--background-color);
      color: var(--text-color);
    }

    #chat-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .chat-container__messages {
      color: var(--text-color);
      display: flex;
      flex-direction: column;
      padding: 0;
    }

    .message-bubble {
      max-width: 80%;
      min-width: 70%;
      display: flex;
      flex-direction: column; 
    }

    .message-bubble-txt {
      background-color: var(--bubble-color);
      color: var(--bubble-text-color);
      border-radius: 10px;
      margin-top: 8px;
      padding: 20px;
      word-wrap: break-word;
      margin-block-end: 0;
    }

    .message-bubble-txt.user-message {
      background-color: var(--user-bubble-color);
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
  `;
  
  // Send the question to the Open AI API and render the answer in the chat
  async sendQuestionToAPI(question: string) {
    // Simulate an API call (replace with actual API endpoint)
    if (this.currentQuestion.trim() === '') {
      return;
    }
    
    this.addMessage(question, true);
    // remove default prompts
    this.isChatStarted = true;
    // disable the input field and submit button while waiting for the API response
    this.isInputDisabled = true;
    this.isSubmitButtonDisabled = true;
    try {
      await fetch(`${globalConfig.API_URL_LOCAL}`, {
        method: 'POST',
        body: JSON.stringify({ question: this.currentQuestion }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.text();
      }).then((text) => {
        console.log(text);
        // add the response to the chat
        this.addMessage(text, false);
      });
      // enable the input field and submit button again
      this.isInputDisabled = false;
      this.isSubmitButtonDisabled = false;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // add a message to the chat, when the user or the API sends a message
  addMessage(message: string, isUserMessage: boolean) {
    const timestamp = this.getTimestamp();
    this.chatMessages = [...this.chatMessages, { 
      text: message,
      timestamp: timestamp,
      isUserMessage 
    }];
    this.requestUpdate();
  }

  // handle the click on a default prompt
  handleDefaultQuestionClick(question: string) {
    this.questionInput.value = question;
    this.currentQuestion = question;
  }

  // Handle the click on the chat button and send the question to the API
  handleUserQuestionSubmit(e: Event) {
    e.preventDefault();
    console.log('User question: ', this.questionInput.value);
    const userQuestion = this.questionInput.value;
    if (userQuestion) {
      this.currentQuestion = userQuestion;
      this.sendQuestionToAPI(userQuestion);
      this.questionInput.value = '';
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
  resetInputField() {
    this.questionInput.value = '';
    this.currentQuestion = '';
  }

  // Web Component render function
  override render() {
    return html`
      <div id="chat-container">
        <ul class="chat-container__messages">
          ${this.chatMessages.map(
            (message) => html`
              <li class="message-bubble ${message.isUserMessage ? 'user-message' : ''}">
                <p class="message-bubble-txt ${message.isUserMessage ? 'user-message' : ''}">${message.text}</p>
                <p class="message-info"><span class="timestamp">${message.timestamp}</span>, 
                  <span class="user">${message.isUserMessage ? 'You' : globalConfig.USER_IS_BOT}</span>
                </p>
              </li>
            `
          )}
        </ul>
        <!-- Default prompts: use the variables above to edit the heading -->
        <div class="chat-container__questions">
          <h3 class="chat-container__subHl">${this.defaultPromptsHeading}</h3>
          <!-- Conditionally render default prompts based on showDefaultPrompts -->
          ${this.showDefaultPrompts
            ? html`
                <div class="defaultPrompts-container">
                  <ul>
                  ${this.defaultPrompts.map(
                    (prompt) => html`
                    <li>
                    <button  type="reset" @click="" title="${prompt}">${prompt}</button>
                    </li>
                    `
                  )}
                </ul>
                </div>
              `
            : ''}
        </div>
        </section>
        <form @submit="">
          <label id="chatboxLabel" for="chatbox">${globalConfig.CHAT_INPUT_LABEL_TEXT}</label>
          <input id="questionInput" placeholder="${globalConfig.CHAT_INPUT_PLACEHOLDER}" aria-labelledby="chatboxLabel" id="chatbox" name="chatbox"  type="text" :value="">
          <button @click="${this.handleUserQuestionSubmit}" title="${globalConfig.CHAT_BUTTON_LABEL_TEXT}">${globalConfig.CHAT_BUTTON_LABEL_TEXT}</button>
          <button @click="${this.resetInputField}" title="${globalConfig.RESET_BUTTON_LABEL_TEXT}">${globalConfig.RESET_BUTTON_LABEL_TEXT}</button>
        </form>
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
