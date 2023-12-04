import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { styles } from '../styles/chat-action-button.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

export interface ChatStage {
  label: string;
  svgIcon: string;
  url: string;
  isEnabled: boolean;
}

@customElement('chat-avatar')
export class ChatAvatarComponent extends LitElement {
  static override styles = [styles];

  @property({ type: String })
  label = '';

  @property({ type: String })
  svgIcon = '';

  @property({ type: String })
  url = '';

  @property({ type: Boolean })
  isEnabled = false;

  override render() {
    return html`
      <a class="chat-avatar__link" title="${this.label}" href="${this.url}" target="_blank" rel="noopener noreferrer">
        ${unsafeSVG(this.svgIcon)}
      </a>
    `;
  }
}
