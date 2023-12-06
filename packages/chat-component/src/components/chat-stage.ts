import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from '../styles/chat-stage.js';
import './link-icon.js';
export interface ChatStage {
  pagetitle: string;
  svgIcon: string;
  isEnabled: boolean;
}

@customElement('chat-stage')
export class ChatStageComponent extends LitElement {
  static override styles = [styles];

  @property({ type: String })
  pagetitle = '';

  @property({ type: String })
  url = '';

  @property({ type: Boolean })
  isEnabled = false;

  @property({ type: String })
  svgIcon = '';

  override render() {
    return html`
      <header class="chat-stage__header">
        <link-icon url="${this.url}" svgIcon="${this.svgIcon}" isEnabled="${this.isEnabled}"></link-icon>
        <h1 class="chat-stage__hl">${this.pagetitle}</h1>
      </header>
    `;
  }
}
