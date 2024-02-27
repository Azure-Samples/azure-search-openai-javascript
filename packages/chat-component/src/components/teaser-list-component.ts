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
  heading: string | undefined = undefined;

  @property({ type: String })
  actionLabel: string | undefined = undefined;

  @property({ type: Boolean })
  alwaysRow = false;

  @property({ type: Boolean })
  clickable = false;

  // Handle the click on a default prompt
  handleTeaserClick(teaser: Teaser, event?: Event): void {
    event?.preventDefault();
    const teaserClickEvent = new CustomEvent<InputValue>('teaser-click', {
      detail: {
        value: teaser.description,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(teaserClickEvent);
  }

  renderClickableTeaser(teaser: Teaser) {
    return html`
      <a
        role="button"
        href="#"
        data-testid="default-question"
        @click="${(event: Event) => this.handleTeaserClick(teaser, event)}"
      >
        ${teaser.description}
        <span class="teaser-click-label">${this.actionLabel}</span>
      </a>
    `;
  }
  override render() {
    return html`
      <div class="teaser-list-container">
        ${this.heading ? html`<h1 class="headline">${this.heading}</h1>` : ''}
        <ul class="teaser-list ${this.alwaysRow ? 'always-row' : ''}">
          ${this.teasers.map(
            (teaser) => html`
              <li class="teaser-list-item">
                ${this.clickable ? this.renderClickableTeaser(teaser) : teaser.description}
              </li>
            `,
          )}
        </ul>
      </div>
    `;
  }
}
