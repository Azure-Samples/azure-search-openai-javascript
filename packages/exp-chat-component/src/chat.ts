import { LitElement, css, html, nothing } from 'lit';
import { map } from 'lit/directives/map.js';
import { repeat } from 'lit/directives/repeat.js';
import { customElement, property, state } from 'lit/decorators.js';
import { Message, ChatRequestOptions, ChatResponse, ChatMessage, ChatResponseChunk } from './models.js';
import { getCitationUrl, getCompletion } from './api.js';
import { parseMessageIntoHtml } from './message-parser.js';

export type ChatComponentOptions = ChatRequestOptions & {
  oneShot: boolean;
  enablePromptSuggestions: boolean;
  promptSuggestions: string[];
  strings: {
    promptSuggestionsLabel: string;
    citationsLabel: string;
    chatInputPlaceholder: string;
    chatInputButtonLabel: string;
    assistant: string;
    user: string;
    errorMessage: string;
    cleanChatButton: string;
    retryButton: string;
  };
};

export const defaultOptions: ChatComponentOptions = {
  approach: 'rrr' as const,
  suggestFollowupQuestions: true,
  oneShot: false,
  stream: true,
  chunkIntervalMs: 30,
  enablePromptSuggestions: true,
  promptSuggestions: [
    // TODO: do no provide defaults here
    'How to search and book rentals?',
    'What is the refund policy?',
    'How to contact a representative?',
  ],
  messages: [],
  strings: {
    promptSuggestionsLabel: 'Suggestions',
    citationsLabel: 'Citations',
    chatInputPlaceholder: 'Type your question, eg. "How to search and book rentals?"',
    chatInputButtonLabel: 'Send question',
    assistant: 'Support Assistant',
    user: 'User',
    errorMessage: 'We are currently experiencing an issue.',
    cleanChatButton: 'Clear chat',
    retryButton: 'Retry',
  },
};

/**
 *
 * fires:
 * - messagesUpdated
 */
@customElement('chat-component')
export class ChatComponent extends LitElement {
  @property({
    type: Object,
    converter: (value) => ({ ...defaultOptions, ...JSON.parse(value || '{}') }),
  })
  options: ChatComponentOptions = defaultOptions;

  @property() question = '';
  @state() private messages: ChatMessage[] = [];
  @state() private hasError = false;
  @state() private isLoading = false;

  onSuggestionClicked(suggestion: string) {
    this.question = suggestion;
    this.onChatSubmit();
  }

  onCitationClicked(citation: string) {
    // todo
    const path = getCitationUrl(citation);
    console.log(path);
  }

  async onChatSubmit() {
    this.hasError = false;
    this.messages = [
      ...this.messages,
      {
        content: this.question,
        role: 'user',
      },
    ];
    this.question = '';
    try {
      const response = await getCompletion({ ...this.options, messages: this.messages }, this.options.oneShot);
      if (this.options.stream && !this.options.oneShot) {
        const messages = this.messages;
        const message: ChatMessage = {
          content: '',
          role: 'assistant',
          context: {
            data_points: [],
            thoughts: '',
          },
        };
        const chunks = response as AsyncGenerator<ChatResponseChunk>;
        for await (const chunk of chunks) {
          if (chunk.choices[0].delta.context?.data_points) {
            message.context!.data_points = chunk.choices[0].delta.context?.data_points;
            message.context!.thoughts = chunk.choices[0].delta.context?.thoughts ?? '';
          } else if (chunk.choices[0].delta.content) {
            message.content += chunk.choices[0].delta.content;
            this.messages = [...messages, message];
          }
        }
      } else {
        const chatResponse = response as ChatResponse;
        this.messages = [...this.messages, chatResponse.choices[0].message];
      }

      // todo: wait for the setTimeout here

      const messagesUpdatedEvent = new CustomEvent('messagesUpdated', {
        detail: { messages: this.messages },
      });
      this.dispatchEvent(messagesUpdatedEvent);
    } catch (error) {
      this.hasError = true;
      console.error(error);
    }
  }

  private renderSuggestions = (suggestions: string[]) => {
    return html`
      <section class="suggestions">
        <h2>Suggestions</h2>
        <ul>
          ${map(
            suggestions,
            (suggestion) =>
              html`<li>
                <button @click=${() => this.onSuggestionClicked(suggestion)}>${suggestion}</button>
              </li>`,
          )}
        </ul>
      </section>
    `;
  };

  private renderMessage = (message: Message) => {
    const parsedMessage = parseMessageIntoHtml(message.content, this.renderCitationLink);
    return html`<li class="message">
      <slot name="message-header"></slot>
      <div class="message-body">
        <p>${parsedMessage.html}</p>
        ${parsedMessage.citations.length > 0
          ? html`<b>Citations</b> ${map(parsedMessage.citations, this.renderCitation)}`
          : nothing}
        ${parsedMessage.followupQuestions.length > 0
          ? html`<b>Follow-up questions</b> ${map(parsedMessage.followupQuestions, this.renderFollowupQuestion)}`
          : nothing}
      </div>
      <div class="message-role">${message.role}</div>
    </li>`;
  };

  private renderError = () => {
    return html`<p class="error">Error!</p>`;
  };

  private renderCitation = (citation: string, index: number) => {
    return html`<button @click=${() => this.onCitationClicked(citation)}>${index}. ${citation}</button>`;
  };

  private renderCitationLink = (citation: string, index: number) => {
    return html`<button @click=${() => this.onCitationClicked(citation)}><sup>[${index}]</sup></button>`;
  };

  private renderFollowupQuestion = (question: string) => {
    return html`<button @click=${() => this.onSuggestionClicked(question)}>${question}</button>`;
  };

  protected override render() {
    return html`
      <section class="chat-container">
        ${this.options.enablePromptSuggestions && this.options.promptSuggestions.length > 0
          ? this.renderSuggestions(this.options.promptSuggestions)
          : nothing}
        <ul class="chat-messages">
          ${repeat(this.messages, (_, index) => index, this.renderMessage)}
        </ul>
        ${this.isLoading ? html`<slot name="loader"><div class="loader"></div></slot>` : nothing}
        ${this.hasError ? this.renderError() : nothing}
        <div class="chat-input">
          <input
            placeholder="${this.options.strings.chatInputPlaceholder}"
            type="text"
            .value=${this.question}
            @input=${(e) => (this.question = e.target.value)}
            autocomplete="off"
          />
          <button @click=${this.onChatSubmit} title="${this.options.strings.chatInputButtonLabel}">
            ${this.options.strings.chatInputButtonLabel}
          </button>
        </div>
      </section>
    `;
  }

  static override styles = css`
    .message {
      border: 1px solid var(--cc-message-border, grey);
    }
    .message-body {
      white-space: pre-line;
    }
    .error {
      color: var(--cc-error-text, red);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'chat-component': ChatComponent;
  }
}
