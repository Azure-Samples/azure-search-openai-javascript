import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { styles } from '../styles/link-icon.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

export interface LinkIcon {
  label: string;
  svgIcon: string;
  url: string;
}

@customElement('link-icon')
export class LinkIconComponent extends LitElement {
  static override styles = [styles];

  @property({ type: String })
  label = '';

  @property({ type: String })
  svgIcon = '';

  @property({ type: String })
  url = '';

  override render() {
    return html`
      <a title="${this.label}" href="${this.url}" target="_blank" rel="noopener noreferrer">
        ${unsafeSVG(this.svgIcon)}
      </a>
    `;
  }
}
