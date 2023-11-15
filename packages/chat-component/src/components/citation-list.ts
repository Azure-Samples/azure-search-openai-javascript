import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { styles } from '../styles/citation-list.js';

@customElement('citation-list')
export class CitationListComponent extends LitElement {
  @property({ type: String })
  label: string | undefined = undefined;

  @property({ type: Array })
  citations: Citation[] | undefined = undefined;

  static override styles = [styles];

  handleCitationClick(citation: Citation, event: Event) {
    event.preventDefault();
    const citationClickEvent = new CustomEvent('on-citation-click', {
      detail: {
        citation,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(citationClickEvent);
  }

  renderCitation(citations: Citation[] | undefined) {
    // render citations
    if (citations && citations.length > 0) {
      return html`
        <ol class="items__list citations">
          ${this.label ? html`<h3 class="subheadline--small">${this.label}</h3>` : ''}
          ${citations.map(
            (citation) => html`
              <li class="items__listItem--citation">
                <a
                  class="items__link"
                  href="#"
                  data-testid="citation"
                  @click="${(event: Event) => this.handleCitationClick(citation, event)}"
                  >${citation.ref}. ${citation.text}</a
                >
              </li>
            `,
          )}
        </ol>
      `;
    }
    return '';
  }

  override render() {
    return this.renderCitation(this.citations);
  }
}
