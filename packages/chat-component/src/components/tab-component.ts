import { LitElement, type TemplateResult, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tabStyle } from '../styles/tab-component.js';

export interface TabContent {
  id: string;
  label: string;
  render: () => TemplateResult<1>;
}

@customElement('tab-component')
export class TabComponent extends LitElement {
  @property({ type: Array })
  tabs: TabContent[] = [];

  @property({ type: String })
  selectedTabId: string | undefined = undefined;

  static override styles = [tabStyle];

  activateTab(event: Event) {
    event.preventDefault();
    const tabId = (event.target as HTMLAnchorElement).id;
    this.selectedTabId = tabId;
    this.requestUpdate();
  }

  renderTabListItem(tabContent: TabContent, isSelected: boolean) {
    return html`
      <li class="tab-component__listItem">
        <a
          id="${tabContent.id}"
          class="tab-component__link ${isSelected ? 'active' : ''}"
          role="tab"
          href="#"
          aria-selected="${isSelected}"
          aria-hidden="${!isSelected}"
          aria-controls="tabpanel-${tabContent.id}"
          @click="${(event: Event) => this.activateTab(event)}"
          title="${tabContent.label}"
        >
          ${tabContent.label}
        </a>
      </li>
    `;
  }

  renderTabContent(tabContent: TabContent, isSelected: boolean) {
    return html`
      <div
        id="tabpanel-${tabContent.id}"
        class="tab-component__tab ${isSelected ? 'active' : ''}"
        role="tabpanel"
        tabindex="${isSelected ? '0' : '-1'}"
        aria-labelledby="${tabContent.id}"
      >
        <h3 class="subheadline--small">${tabContent.label}</h3>
        ${tabContent.render()}
      </div>
    `;
  }

  override render() {
    return html`
      <div class="tab-component">
        <nav class="tab-component__nav">
          <ul class="tab-component__list" role="tablist">
            ${this.tabs.map((tabContent) => this.renderTabListItem(tabContent, tabContent.id === this.selectedTabId))}
          </ul>
        </nav>
        <div class="tab-component__content">
          ${this.tabs.map((tabContent) => this.renderTabContent(tabContent, tabContent.id === this.selectedTabId))}
        </div>
      </div>
    `;
  }
}
