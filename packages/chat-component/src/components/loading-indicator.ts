import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from '../styles/loading-indicator.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import iconSpinner from '../../public/svg/spinner-icon.svg?raw';

@customElement('loading-indicator')
export class LoadingIndicatorComponent extends LitElement {
  static override styles = [styles];

  @property({ type: String })
  label: string = '';

  override render() {
    return html`
      <p data-testid="loading-indicator" aria-label="${this.label}">
        <span>${unsafeSVG(iconSpinner)}</span>
        <span>${this.label}</span>
      </p>
    `;
  }
}
