import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { styles } from '../styles/chat-action-button.js';
import { globalConfig } from '../config/global-config.js';

export interface ChatStage {
  label: string;
  svgIcon: string;
  isEnabled: boolean;
}

@customElement('chat-stage')
export class ChatStageComponent extends LitElement {
  static override styles = [styles];

  @property({ type: String })
  pagetile = '';

  @property({ type: Boolean })
  isEnabled = false;

  override render() {
    if (!this.isEnabled) {
      return html``;
    }
    return html`
      <header class="branding__banner">
        <chat-avatar
          url="${globalConfig.BRANDING_LOGO_URL}"
          label="${globalConfig.BRANDING_LOGO_ALT_TEXT}"
          svgIcon=""
        ></chat-avatar>
        <h1 class="branding__hl">${globalConfig.BRANDING_HEADLINE}</h1>
      </header>
    `;
  }
}
