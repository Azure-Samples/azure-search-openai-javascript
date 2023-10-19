import { LitElement, css, html, nothing } from 'lit';
import { map } from 'lit/directives/map.js';
import { repeat } from 'lit/directives/repeat.js';
import { customElement, property, state } from 'lit/decorators.js';
import {
  type Message,
  type ChatRequestOptions,
  type ChatResponse,
  type ChatMessage,
  type ChatResponseChunk,
} from './models.js';
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
    'How to search and book rentals?',
    'What is the refund policy?',
    'How to contact a representative?',
  ],
  messages: [],
  strings: {
    promptSuggestionsLabel: 'Ask anything or try an example',
    citationsLabel: 'Citations',
    chatInputPlaceholder: 'Type your question (e.g. "How to search and book rentals?")',
    chatInputButtonLabel: 'Send question',
    assistant: 'Support Assistant',
    user: 'You',
    errorMessage: 'We are currently experiencing an issue.',
    cleanChatButton: 'Clear chat',
    retryButton: 'Retry',
  },
};

/**
 * A chat component that allows the user to ask questions and get answers from an API.
 * The component also displays default prompts that the user can click on to ask a question.
 * The component is built as a custom element that extends LitElement.
 *
 * Labels and other aspects are configurable via the `option` property.
 * @element azc-chat
 * @fires messagesUpdated - Fired when the message thread is updated
 * */
@customElement('azc-chat')
export class ChatComponent extends LitElement {
  @property({
    type: Object,
    converter: (value) => ({ ...defaultOptions, ...JSON.parse(value || '{}') }),
  })
  options: ChatComponentOptions = defaultOptions;

  @property() question = '';
  @state() protected messages: ChatMessage[] = [];
  @state() protected hasError = false;
  @state() protected isLoading = false;
  @state() protected isStreaming = false;

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
    if (this.isLoading) return;

    this.hasError = false;
    this.messages = [
      ...this.messages,
      {
        content: this.question,
        role: 'user',
      },
    ];
    this.question = '';
    this.isLoading = true;
    try {
      const response = await getCompletion({ ...this.options, messages: this.messages }, this.options.oneShot);
      if (this.options.stream && !this.options.oneShot) {
        this.isStreaming = true;
        const chunks = response as AsyncGenerator<ChatResponseChunk>;
        const messages = this.messages;
        const message: ChatMessage = {
          content: '',
          role: 'assistant',
          context: {
            data_points: [],
            thoughts: '',
          },
        };
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

      this.isLoading = false;
      this.isStreaming = false;
      const messagesUpdatedEvent = new CustomEvent('messagesUpdated', {
        detail: { messages: this.messages },
      });
      this.dispatchEvent(messagesUpdatedEvent);
    } catch (error) {
      this.hasError = true;
      console.error(error);
    }
  }

  protected renderSuggestions = (suggestions: string[]) => {
    return html`
      <section class="suggestions">
        <h2>${this.options.strings.promptSuggestionsLabel}</h2>
        <div class="suggestions-list">
          ${map(
            suggestions,
            (suggestion) =>
              html`<button class="suggestion" @click=${() => this.onSuggestionClicked(suggestion)}>
                ${suggestion}
              </button>`,
          )}
        </div>
      </section>
    `;
  };

  protected renderLoader = () => {
    return this.isLoading && !this.isStreaming
      ? html`<div class="message assistant">
          <slot name="message-header"></slot>
          <div class="message-body">
            <p>
              <slot name="loader"><div class="loader"></div></slot>
            </p>
            <div class="message-role">${this.options.strings.assistant}</div>
          </div>
        </div>`
      : nothing;
  };

  protected renderMessage = (message: Message) => {
    const parsedMessage = parseMessageIntoHtml(message.content, this.renderCitationLink);
    return html`
      <div class="message ${message.role}">
        ${message.role === 'assistant' ? html`<slot name="message-header"></slot>` : nothing}
        <div class="message-body">
          <p>${parsedMessage.html}</p>
          ${parsedMessage.citations.length > 0
            ? html`<b>Citations</b> ${map(parsedMessage.citations, this.renderCitation)}`
            : nothing}
          ${parsedMessage.followupQuestions.length > 0
            ? html`<b>Follow-up questions</b> ${map(parsedMessage.followupQuestions, this.renderFollowupQuestion)}`
            : nothing}
        </div>
        <div class="message-role">
          ${message.role === 'user' ? this.options.strings.user : this.options.strings.assistant}
        </div>
      </div>
    `;
  };

  protected renderError = () => {
    return html`<p class="error">Error!</p>`;
  };

  protected renderCitation = (citation: string, index: number) => {
    return html`<button @click=${() => this.onCitationClicked(citation)}>${index}. ${citation}</button>`;
  };

  protected renderCitationLink = (citation: string, index: number) => {
    return html`<button @click=${() => this.onCitationClicked(citation)}><sup>[${index}]</sup></button>`;
  };

  protected renderFollowupQuestion = (question: string) => {
    return html`<button @click=${() => this.onSuggestionClicked(question)}>${question}</button>`;
  };

  protected override render() {
    return html`
      <section class="chat-container">
        ${this.options.enablePromptSuggestions && this.options.promptSuggestions.length > 0
          ? this.renderSuggestions(this.options.promptSuggestions)
          : nothing}
        <div class="chat-messages">
          ${repeat(this.messages, (_, index) => index, this.renderMessage)} ${this.renderLoader()}
        </div>
        ${this.hasError ? this.renderError() : nothing}
        <div class="chat-input">
          <textarea
            class="text-input"
            placeholder="${this.options.strings.chatInputPlaceholder}"
            type="text"
            .value=${this.question}
            @input=${(event) => (this.question = event.target.value)}
            autocomplete="off"
            ?disabled=${this.isLoading}
          ></textarea>
          <button
            @click=${this.onChatSubmit}
            title="${this.options.strings.chatInputButtonLabel}"
            ?disabled=${this.isLoading || !this.question}
          >
            ${this.options.strings.chatInputButtonLabel}
          </button>
        </div>
      </section>
    `;
  }

  static override styles = css`
    :host {
      --primary: var(--azc-primary, #0af);
      --accent: var(--azc-accent, #64f);
      --error: var(--azc-error, #e20);
      --border-radius: var(--azc-border-radius, 6px);
      --space-md: var(--azc-space-md, 12px);
      --space-xl: var(--azc-space-xl, calc(var(--space-md) * 2));
      --error-color: var(--azc-error-color, #e20);
      --error-border: var(--azc-error-border, #e20);
      --error-bg: var(--azc-error-bg, #fec);
      --user-message-color: var(--azc-user-message-color, #000);
      --user-message-border: var(--azc-user-message-border, grey);
      --user-message-bg: var(--azc-user-message-bg, lightgrey);
      --bot-message-color: var(--azc-bot-message-color, #000);
      --bot-message-border: var(--azc-bot-message-border, grey);
      --bot-message-bg: var(--azc-user-message-bg, lightgrey);
      --chat-input-color: var(--azc-chat-input-color, #000);
      --chat-input-border: var(--azc-chat-input-border, #000);
      --chat-input-bg: var(--azc-chat-input-bg, #f5f5f5);
      --submit-button-color: var(--azc-button-color, #000);
      --submit-button-border: var(--azc-submit-button-color, #000);
      --submit-button-bg: var(--azc-submit-button-color, #f2f2f2);

      font-family:
        'Segoe UI',
        -apple-system,
        BlinkMacSystemFont,
        Roboto,
        'Helvetica Neue',
        sans-serif;
    }
    *:focus-visible {
      outline: 2px solid var(--primary);
    }
    button {
      font-size: 1rem;
    }
    .suggestions {
      text-align: center;
    }
    .suggestions-list {
      display: flex;
      gap: var(--space-md);
    }
    .suggestion {
      flex: 1 1 0;
      padding: var(--space-md);
      border: 1px solid #999;
      border-radius: var(--border-radius);
      background: #eee;
      cursor: pointer;
    }
    .chat-messages {
      margin: var(--space-md) 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .user {
      align-self: end;
    }
    .assistant {
    }
    .message {
      width: auto;
      max-width: 70%;
      border: 1px solid var(--azc-message-border, grey);
      border-radius: calc(var(--border-radius) * 2);
      padding: var(--space-xl);
    }
    .message-body {
      white-space: pre-line;
    }
    .submit-button {
      border: 1px solid var(--button-border);
      background: var(--azc-submit-button-color);
      border-radius: var(--border-radius);
    }
    .error {
      color: var(--error-color);
    }
    .chat-input {
      display: flex;
      border: 1px solid var(--chat-input-border);
      border-radius: var(--border-radius);
      padding: var(--space-md);
    }
    .text-input {
      font-family: inherit;
      font-size: 1rem;
      flex: 1 auto;
      height: 3rem;
      border: none;
      resize: none;
      &:focus {
        outline: none;
      }
    }
    .loader {
      --size: 4rem;
      --stroke-width: calc(var(--size) / 8);
      width: var(--size);
      height: var(--stroke-width);
      background-color: currentColor;
      transform: scaleX(0);
      transform-origin: center left;
      animation: cubic-bezier(0.85, 0, 0.15, 1) 2s infinite load-animation;
    }

    @keyframes load-animation {
      0% {
        transform: scaleX(0);
        transform-origin: center left;
      }
      50% {
        transform: scaleX(1);
        transform-origin: center left;
      }
      51% {
        transform: scaleX(1);
        transform-origin: center right;
      }
      100% {
        transform: scaleX(0);
        transform-origin: center right;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'azc-chat': ChatComponent;
  }
}
