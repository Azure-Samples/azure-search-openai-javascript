import { LitElement, type PropertyValueMap, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { globalConfig } from '../config/global-config.js';
import { marked } from 'marked';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import './loading-indicator.js';

@customElement('document-previewer')
export class DocumentPreviewerComponent extends LitElement {
  @property({ type: String })
  url: string | undefined = undefined;

  @state()
  previewContent: string | undefined = undefined;

  @state()
  loading: boolean = false;

  retrieveMarkdown() {
    if (this.url) {
      fetch(this.url)
        .then((response) => response.text())
        .then((text) => {
          this.previewContent = marked.parse(text);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }

  override willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (
      this.url &&
      _changedProperties.has('url') &&
      _changedProperties.get('url') !== this.url &&
      this.url.endsWith('.md')
    ) {
      this.loading = true;
      this.retrieveMarkdown();
    }
  }

  renderContent() {
    if (this.url) {
      return html`
        ${this.previewContent
          ? html` ${unsafeHTML(this.previewContent)}`
          : html` <iframe title="Preview" src="${this.url}" width="100%" height="850px" sandbox />`}
      `;
    }

    return html``;
  }

  override render() {
    return html`
      ${this.loading
        ? html`<loading-indicator label="${globalConfig.LOADING_TEXT}"></loading-indicator>`
        : this.renderContent()}
    `;
  }
}
