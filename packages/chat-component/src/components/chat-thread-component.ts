import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { styles } from '../styles/chat-thread-component.js';

import { globalConfig } from '../config/global-config.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { chatEntryToString } from '../utils/index.js';

import iconSuccess from '../../public/svg/success-icon.svg?raw';
import iconCopyToClipboard from '../../public/svg/copy-icon.svg?raw';
import iconQuestion from '../../public/svg/bubblequestion-icon.svg?raw';

import './citation-list.js';
import './chat-action-button.js';
import { type ChatActionButton } from './chat-action-button.js';

@customElement('chat-thread-component')
export class ChatThreadComponent extends LitElement {
  static override styles = [styles];

  @property({ type: Array })
  chatThread: ChatThreadEntry[] = [];

  @property({ type: Array })
  actionButtons: ChatActionButton[] = [];

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

  // Copy response to clipboard
  copyResponseToClipboard(entry: ChatThreadEntry): void {
    const response = chatEntryToString(entry);

    navigator.clipboard.writeText(response);
    this.isResponseCopied = true;
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

  handleFollowupQuestionClick(question: string, entry: ChatThreadEntry, event: Event) {
    event.preventDefault();
    const followUpClickEvent = new CustomEvent('on-followup-click', {
      detail: {
        question,
        chatThreadEntry: entry,
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
          ${this.actionButtons.map(
            (actionButton) => html`
              <chat-action-button
                .label="${actionButton.label}"
                .svgIcon="${actionButton.svgIcon}"
                .isDisabled="${actionButton.isDisabled}"
                .actionId="${actionButton.id}"
                @click="${(event) => this.actionButtonClicked(actionButton, entry, event)}"
              ></chat-action-button>
            `,
          )}
          <chat-action-button
            .label="${globalConfig.COPY_RESPONSE_BUTTON_LABEL_TEXT}"
            .svgIcon="${this.isResponseCopied ? iconSuccess : iconCopyToClipboard}"
            .isDisabled="${this.isDisabled}"
            actionId="copy-to-clipboard"
            .tooltip="${this.isResponseCopied
              ? globalConfig.COPIED_SUCCESSFULLY_MESSAGE
              : globalConfig.COPY_RESPONSE_BUTTON_LABEL_TEXT}"
            @click="${this.copyResponseToClipboard}"
          ></chat-action-button>
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

  renderFollowupQuestions(entry: ChatThreadEntry) {
    const followupQuestions = entry.followupQuestions;
    // render followup questions
    // need to fix first after decoupling of teaserlist
    if (followupQuestions && followupQuestions.length > 0) {
      return html`
        <div class="items__listWrapper">
          ${unsafeSVG(iconQuestion)}
          <ul class="items__list followup">
            ${followupQuestions.map(
              (followupQuestion) => html`
                <li class="items__listItem--followup">
                  <a
                    class="items__link"
                    href="#"
                    data-testid="followUpQuestion"
                    @click="${(event) => this.handleFollowupQuestionClick(followupQuestion, entry, event)}"
                    >${followupQuestion}</a
                  >
                </li>
              `,
            )}
          </ul>
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
                ${this.renderFollowupQuestions(message)} ${message.error ? this.renderError(message.error) : ''}
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
