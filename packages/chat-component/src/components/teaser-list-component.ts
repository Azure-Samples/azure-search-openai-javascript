import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from '../styles/teaser-list-component.js';

export interface Teaser {
  description: string;
}

@customElement('teaser-list-component')
export class TeaserListComponent extends LitElement {
  static override styles = [styles];

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

  override render() {
    return html`
      <div class="teaser-list-container">
        <h1 class="headline">${this.title}</h1>
        <ul class="teaser-list">
          ${this.teasers.map(
            (teaser) => html`
              <li class="teaser-list-item">
                <a
                  role="button"
                  href="#"
                  data-testid="default-question"
                  @click="${(event: Event) => this.handleTeaserClick(teaser, event)}"
                >
                  ${teaser.description}
                  <span>${this.label}</span>
                </a>
              </li>
            `,
          )}
        </ul>
      </div>
    `;
  }
}
