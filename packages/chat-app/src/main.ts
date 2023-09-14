import { FASTElement, customElement, attr, html, observable, when, repeat } from '@microsoft/fast-element';
import { globalConfig } from './config/globalConfig';

const template = html<ChatComponent>`
  <style>
    :host {
      display: block;
      margin: 0 auto;
      max-width: 500px;
    }
  </style>
  <h2>Ask Support</h2>
  <section class="chat__wrapper">
    ${when(
      (x) => x.showDefaultPrompts,
      html<ChatComponent>`
        <section part="chat__listWrapper" class="chat__listWrapper">
          <h3 class="chat__subHl">${(x) => x.defaultPromptsHeading}</h3>
          <ul part="chat__listWrapper--defaults" class="chat__list flex-container-row">
            ${repeat(
              (x) => x.defaultPrompts,
              html<ChatComponent>`
                <li part="chat__listItem" class="chat__listItem--prompt">
                  <button
                    type="submit"
                    @click="${(x, c) => {
                      console.log(
                        (c.event.currentTarget as HTMLButtonElement).innerText,
                        '#### This the event target ####',
                      );
                      x.handleDefaultQuestionClick((c.event.currentTarget as HTMLButtonElement).innerText);
                    }}"
                  >
                    ${(x) => x}
                  </button>
                </li>
              `,
            )}
          </ul>
        </section>
      `,
    )}
    <section part="chat__listWrapper" class="chat__listWrapper" id="chatWindow">
      <ul part="chat__list--chat" class="chat__list">
        <!-- Render chatMessages as list items -->
        ${repeat(
          (x) => x.chatMessages,
          html<ChatMessage>`${(message) => html`
            <li class="chat__listItem ${message ? 'chat__listItem--userMessage' : ''}">
              <p class="chat__text">"${message.text}"</p>
            </li>
          `}`,
        )}
      </ul>
    </section>
    <form @submit="${(x) => x.submitQuestion()}">
      <label id="chatboxLabel" for="chatbox">${globalConfig.CHAT_INPUT_LABEL_TEXT}</label>
      <input
        placeholder="${globalConfig.CHAT_INPUT_PLACEHOLDER}"
        aria-labelledby="chatboxLabel"
        id="chatbox"
        name="chatbox"
        ?disabled="${(x) => x.isDisabled}"
        type="text"
        :value="${(x) => x.questionInput}"
        @input="${(x, c) => x.handleUserQuestionSubmit(c.event)}"
      />
      <button ?disabled="${(x) => x.isDisabled}" type="submit" title="${globalConfig.CHAT_BUTTON_LABEL_TEXT}">
        ${globalConfig.CHAT_BUTTON_LABEL_TEXT}
      </button>
      <button
        ?disabled="${(x) => x.isDisabled}"
        type="reset"
        @click="${(x) => x.resetInputField()}"
        title="${globalConfig.RESET_BUTTON_LABEL_TEXT}"
      >
        ${globalConfig.RESET_BUTTON_LABEL_TEXT}
      </button>
    </form>
  </section>
`;

declare interface ChatMessage {
  text: string;
  isUserMessage: boolean;
}

@customElement({
  name: 'chat-component',
  template,
})
export class ChatComponent extends FASTElement {
  @observable isChatStarted: boolean = false;
  // These are the chat bubbles that will be displayed in the chat
  @observable chatMessages: ChatMessage[] = [];
  // The question to send to the API
  @observable questionInput: string = '';
  // Are the buttons and inputs disabled?
  isDisabled: boolean = false;
  // Should the default prompts be displayed?
  // Must change string length by input dirty state
  @observable showDefaultPrompts: boolean = globalConfig.IS_DEFAULT_PROMPTS_ENABLED;
  defaultPrompts: string[] = globalConfig.DEFAULT_PROMPTS;
  defaultPromptsHeading: string = globalConfig.DEFAULT_PROMPTS_HEADING || '';

  // These are the labels for the chat button and input
  chatButtonLabelText: string = globalConfig.CHAT_BUTTON_LABEL_TEXT || '';
  chatInputLabelText: string = globalConfig.CHAT_INPUT_LABEL_TEXT || '';

  // Send the question to the Open AI API and render the answer in the chat
  async sendQuestionToAPI(question: string, isUserMessage: boolean = true) {
    // Simulate an API call (replace with actual API endpoint)
    if (!question) {
      return;
    }
    this.addMessage(isUserMessage);
    // Force update the chat
    this.isChatStarted = true;
    this.isDisabled = true;
    try {
      await fetch(`${globalConfig.API_URL_LOCAL}`, {
        method: 'POST',
        body: JSON.stringify({ question: question }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.text();
        })
        .then((text) => {
          console.log(text);
          // add the response to the chat
          this.questionInput = text;
          isUserMessage = false;
          this.addMessage(isUserMessage);
          this.resetInputField();
          this.isDisabled = false;
        });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // add a message to the chat, when the user or the API sends a message
  addMessage(isUserMessage: boolean) {
    if (!this.questionInput) {
      return;
    }
    this.chatMessages = [
      ...this.chatMessages,
      {
        text: this.questionInput,
        isUserMessage,
      },
    ];
  }

  // handle the click on a default prompt
  handleDefaultQuestionClick(question: string) {
    this.questionInput = question;
    console.log('#### This question was asked from the defaults ####', question);
    this.sendQuestionToAPI(question, false);
  }

  // Handle the click on the chat button and send the question to the API
  handleUserQuestionSubmit(event: Event) {
    this.questionInput = (event.target! as HTMLInputElement).value;
  }

  submitQuestion() {
    const userQuestion = this.questionInput.trim();
    console.log('#### This question was asked ####', userQuestion);
    if (userQuestion) {
      this.sendQuestionToAPI(userQuestion);
      this.resetInputField();
    }
  }

  // Reset the input field and the current question
  resetInputField() {
    this.questionInput = '';
  }

  // Scroll to the bottom of the chat window
  scrollToBottom() {
    const chatWindow = this.shadowRoot!.getElementById('chatWindow');
    chatWindow!.scrollTop = chatWindow!.scrollHeight;
  }
}
