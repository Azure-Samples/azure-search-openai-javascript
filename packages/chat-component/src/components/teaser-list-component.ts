import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { teaserListStyle } from '../styles/teaser-list-component.js';

export interface Teaser {
  description: string;
}

@customElement('teaser-list-component')
export class TeaserListComponent extends LitElement {
  @property({ type: Array })
  teasers: Teaser[] = [];

  @property({ type: String })
  title: string = '';

  @property({ type: String })
  label: string = '';

  // Handle the click on a default prompt
  handleTeaserClick(teaser: Teaser, event?: Event): void {
    event?.preventDefault();
    const teaserClickEvent = new CustomEvent('teaser-click', {
      detail: {
        question: teaser.description,
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
        <h1 class="headline">${this.title}</h1>
        <ul class="teaser-list__list">
          ${this.teasers.map(
            (teaser) => html`
              <li class="teaser-list__listItem">
                <a
                  role="button"
                  href="#"
                  class="teaser-list__button"
                  data-testid="default-question"
                  @click="${(event: Event) => this.handleTeaserClick(teaser, event)}"
                >
                  ${teaser.description}
                  <span class="teaser-list__span">${this.label}</span>
                </a>
              </li>
            `,
          )}
        </ul>
      </div>
    `;
  }
}
