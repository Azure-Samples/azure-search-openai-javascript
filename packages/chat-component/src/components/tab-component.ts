import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from '../styles/tab-component.js';

export interface TabContent {
  id: string;
  label: string;
}

@customElement('tab-component')
export class TabComponent extends LitElement {
  static override styles = [styles];

  @property({ type: Array })
  tabs: TabContent[] = [];

  @property({ type: String })
  selectedTabId: string | undefined = undefined;

  activateTab(event: Event) {
    event.preventDefault();
    const tabId = (event.target as HTMLAnchorElement).id;
    this.selectedTabId = tabId;
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
        <slot name="${tabContent.id}"></slot>
      </div>
    `;
  }

  override render() {
    return html`
      <div class="tab-component">
        <nav>
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
