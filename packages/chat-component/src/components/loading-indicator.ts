import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { loadingIndicatorStyles } from '../styles/loading-indicator.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import iconSpinner from '../../public/svg/spinner-icon.svg?raw';

@customElement('loading-indicator')
export class LoadingIndicatorComponent extends LitElement {
  @property({ type: String })
  label: string = '';

  static override styles = [loadingIndicatorStyles];

  override render() {
    return html`
      <p class="loading-text" aria-label="${this.label}">
        <span class="loading-icon">${unsafeSVG(iconSpinner)}</span>
        <span class="loading-label">${this.label}</span>
      </p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'loading-indicator': LoadingIndicatorComponent;
  }
}
