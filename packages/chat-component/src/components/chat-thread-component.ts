import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { styles } from '../styles/chat-thread-component.js';

import { globalConfig } from '../config/global-config.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { type ChatActionButton } from './chat-action-button.js';
import {
  type ChatEntryActionController,
  type ChatEntryInlineInputController,
  ControllerType,
  lazyMultiInject,
} from './composable.js';
import { type ChatContextController } from './chat-context.js';

@customElement('chat-thread-component')
export class ChatThreadComponent extends LitElement {
  static override styles = [styles];

  @property({ type: Array })
  chatThread: ChatThreadEntry[] = [];

  @property({ type: Boolean })
  isDisabled = false;

  @property({ type: Boolean })
  isProcessingResponse = false;

  @state()
  isResponseCopied = false;

  @query('#chat-list-footer')
  chatFooter!: HTMLElement;

  @property({ type: Object })
  selectedCitation: Citation | undefined = undefined;

  @property({ type: Object })
  context: ChatContextController | undefined = undefined;

  @lazyMultiInject(ControllerType.ChatEntryAction)
  actionCompontents: ChatEntryActionController[] | undefined;

  @lazyMultiInject(ControllerType.ChatEntryInlineInput)
  inlineInputComponents: ChatEntryInlineInputController[] | undefined;

  public constructor() {
    super();
    this.handleInput = this.handleInput.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.actionCompontents) {
      for (const component of this.actionCompontents) {
        component.attach(this, this.context);
      }
    }

    if (this.inlineInputComponents) {
      for (const component of this.inlineInputComponents) {
        component.attach(this, this.context);
      }
    }
  }

  actionButtonClicked(actionButton: ChatActionButton, entry: ChatThreadEntry, event: Event) {
    event.preventDefault();

    const actionButtonClickedEvent = new CustomEvent('on-action-button-click', {
      detail: {
        id: actionButton.id,
        chatThreadEntry: entry,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(actionButtonClickedEvent);
  }

  // debounce dispatching must-scroll event
  debounceScrollIntoView(): void {
    let timeout: any = 0;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (this.chatFooter) {
        this.chatFooter.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  }

  handleInput(input: string) {
    const followUpClickEvent = new CustomEvent('on-input', {
      detail: {
        value: input,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(followUpClickEvent);
  }

  handleCitationClick(citation: Citation, entry: ChatThreadEntry, event: Event) {
    event.preventDefault();
    this.selectedCitation = citation;
    const citationClickEvent = new CustomEvent('on-citation-click', {
      detail: {
        citation,
        chatThreadEntry: entry,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(citationClickEvent);
  }

  renderResponseActions(entry: ChatThreadEntry) {
    return html`
      <header class="chat__header">
        <div class="chat__header--button">
          ${this.actionCompontents?.map((component) => component.render(entry, this.isDisabled))}
        </div>
      </header>
    `;
  }

  renderTextEntry(textEntry: ChatMessageText) {
    const entries = [html`<p class="chat__txt--entry">${unsafeHTML(textEntry.value)}</p>`];

    // render steps
    if (textEntry.followingSteps && textEntry.followingSteps.length > 0) {
      entries.push(html`
        <ol class="items__list steps">
          ${textEntry.followingSteps.map(
            (followingStep) => html` <li class="items__listItem--step">${unsafeHTML(followingStep)}</li> `,
          )}
        </ol>
      `);
    }
    if (this.isProcessingResponse) {
      this.debounceScrollIntoView();
    }
    return html`<div class="chat_txt--entry-container">${entries}</div>`;
  }

  renderCitation(entry: ChatThreadEntry) {
    const citations = entry.citations;
    if (citations && citations.length > 0) {
      return html`
        <div class="chat__citations">
          <citation-list
            .citations="${citations}"
            .label="${globalConfig.CITATIONS_LABEL}"
            .selectedCitation=${this.selectedCitation}
            @on-citation-click="${(event: CustomEvent) =>
              this.handleCitationClick(event.detail.citation, entry, event)}"
          ></citation-list>
        </div>
      `;
    }

    return '';
  }

  renderError(error: { message: string }) {
    return html`<p class="chat__txt error">${error.message}</p>`;
  }

  override render() {
    return html`
      <ul class="chat__list" aria-live="assertive">
        ${this.chatThread.map(
          (message) => html`
            <li class="chat__listItem ${message.isUserMessage ? 'user-message' : ''}">
              <div class="chat__txt ${message.isUserMessage ? 'user-message' : ''}">
                ${message.isUserMessage ? '' : this.renderResponseActions(message)}
                ${message.text.map((textEntry) => this.renderTextEntry(textEntry))} ${this.renderCitation(message)}
                ${this.inlineInputComponents?.map((component) => component.render(message, this.handleInput))}
                ${message.error ? this.renderError(message.error) : ''}
              </div>
              <p class="chat__txt--info">
                <span class="timestamp">${message.timestamp}</span>,
                <span class="user">${message.isUserMessage ? 'You' : globalConfig.USER_IS_BOT}</span>
              </p>
            </li>
          `,
        )}
      </ul>
      <div class="chat__footer" id="chat-list-footer">
        <!-- Do not delete this element. It is used for auto-scrolling -->
      </div>
    `;
  }
}
