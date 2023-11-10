import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { teaserListTexts } from '../config/global-config.js';
import { teaserListStyle } from '../styles/teaserlist-component.js';

@customElement('teaser-list-component')
export class TeaserListComponent extends LitElement {
  @property({ type: Array })
  teasers: Teaser[] = teaserListTexts.DEFAULT_PROMPTS || [];

  @property({ type: String })
  interactionModel;

  @property({ type: String })
  question;

  // Handle the click on a default prompt
  handleTeaserClick(question: string, event?: Event): void {
    event?.preventDefault();
    const teaserClickEvent = new CustomEvent('teaser-click', {
      detail: {
        question,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(teaserClickEvent);
  }

  static override styles = [teaserListStyle];

  override render() {
    return html`
      <div class="teaser-list__container">
        <h1 class="headline">
          ${this.interactionModel === 'chat' ? teaserListTexts.HEADING_CHAT : teaserListTexts.HEADING_ASK}
        </h1>
        <ul class="teaser-list__list">
          ${this.teasers.map(
            (prompt) => html`
              <li class="teaser-list__listItem">
                <a
                  role="button"
                  href="#"
                  class="teaser-list__button"
                  data-testid="default-question"
                  @click="${(event: Event) => this.handleTeaserClick(prompt.description, event)}"
                >
                  ${prompt.description}
                  <span class="teaser-list__span">${teaserListTexts.TEASER_CTA_LABEL}</span>
                </a>
              </li>
            `,
          )}
        </ul>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'teaser-list-component': TeaserListComponent;
  }
}
