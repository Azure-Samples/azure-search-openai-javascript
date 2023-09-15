import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { globalConfig } from './config/globalConfig';
import { TextField } from '@material/mwc-textfield';
import '@material/mwc-textfield';
import '@material/mwc-button';
import '@material/mwc-checkbox';
import '@material/mwc-formfield';

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
  @query('#questionInput') questionInput!: TextField;
  // Default prompts to display in the chat
  @property({ type: Boolean }) isInputDisabled = false;
  @property({ type: Boolean }) isSubmitButtonDisabled = false;
  @property({ type: Boolean }) isChatStarted = false;
  showDefaultPrompts: boolean = globalConfig.IS_DEFAULT_PROMPTS_ENABLED && !this.isChatStarted;
  defaultPrompts: string[] = globalConfig.DEFAULT_PROMPTS;
  defaultPromptsHeading: string = globalConfig.DEFAULT_PROMPTS_HEADING;
  // This are the chat bubbles that will be displayed in the chat
  chatMessages: { text: string; isUserMessage: boolean }[] = [];
  // This are the labels for the chat button and input
  chatButtonLabelText: string = globalConfig.CHAT_BUTTON_LABEL_TEXT;
  chatInputLabelText: string = globalConfig.CHAT_INPUT_LABEL_TEXT;

  static override styles = css`
    :host {
      display: block;
      padding: 16px;
      --bubble-color: #f0f0f0;
      --user-bubble-color: #d7c6f878;
    }

    #chat-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .chat-container__messages {
      display: flex;
      flex-direction: column;
    }

    .message-bubble {
      background-color: var(--bubble-color);
      border-radius: 10px;
      margin-top: 8px;
      padding: 8px 12px;
      max-width: 80%;
      word-wrap: break-word;
      display: flex; 
    }

    .user-message {
      align-self: flex-end;
      background-color: var(--user-bubble-color);
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
    this.chatMessages = [...this.chatMessages, { text: message, isUserMessage }];
    this.requestUpdate();
  }

  // handle the click on a default prompt
  handleDefaultQuestionClick(question: string) {
    this.questionInput.value = question;
    this.currentQuestion = question;
  }

  // Handle the click on the chat button and send the question to the API
  handleUserQuestionSubmit() {
    const userQuestion = this.questionInput.value;
    if (userQuestion) {
      this.currentQuestion = userQuestion;
      this.sendQuestionToAPI(userQuestion);
      this.questionInput.value = '';
    }
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
        <div class="chat-container__messages">
          ${this.chatMessages.map(
            (message) => html`
              <div class="message-bubble ${message.isUserMessage ? 'user-message' : ''}">
                ${message.text}
              </div>
            `
          )}
        </div>
        <!-- Default prompts: use the variables above to edit the heading -->
        <div class="chat-container__questions">
          <h3 class="chat-container__subHl">${this.defaultPromptsHeading}</h3>
          <!-- Conditionally render default prompts based on showDefaultPrompts -->
          ${this.showDefaultPrompts
            ? html`
                <div class="defaultPrompts-container">
                  ${this.defaultPrompts.map(
                    (prompt) => html`
                      <mwc-button
                        @click=${() => this.handleDefaultQuestionClick(prompt)}
                        label=${prompt}
                      ></mwc-button>
                    `
                  )}
                </div>
              `
            : ''}
        </div>
        <mwc-textfield
          id="questionInput"
          label="${this.chatInputLabelText}"
          outlined
          ?disabled="${this.isInputDisabled}"
          @input=${(e: Event) => (this.currentQuestion = (e.target as TextField).value)}
        ></mwc-textfield>
        <!-- This is the send button -->
        <mwc-button 
          @click=${this.handleUserQuestionSubmit}
          raised
          ?disabled="${this.isSubmitButtonDisabled}"
          label="${this.chatButtonLabelText}"
        ></mwc-button>
        <!-- This is the reset button -->
        <mwc-button
          @click=${this.resetInputField}
          outlined
          ?disabled="${this.isSubmitButtonDisabled}"
          label="${globalConfig.RESET_BUTTON_LABEL_TEXT}"
        ></mwc-button>
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
