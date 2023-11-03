import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { tabStyle } from '../styles/tab-component.js';
import { globalConfig } from '../config/global-config.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

@customElement('tab-component')
export class TabComponent extends LitElement {
  @property()
  chatThoughts: string = '';

  @property()
  chatDataPoints: string[] = [];

  @property({ type: Object })
  chatCitations;

  static override styles = [tabStyle];
  // display active tab content
  // this is basically a tab component
  // and it would be ideal to decouple it from the chat component
  activateTab(event: Event): void {
    event.preventDefault();
    const clickedLink = event.target as HTMLElement;
    const linksNodeList = this.shadowRoot?.querySelectorAll('.tab-component__link');

    if (linksNodeList) {
      const linksArray = [...linksNodeList];
      const clickedIndex = linksArray.indexOf(clickedLink);
      const tabsNodeList = this.shadowRoot?.querySelectorAll('.tab-component__tab');

      if (tabsNodeList) {
        const tabsArray = [...tabsNodeList] as HTMLElement[];

        for (const [index, tab] of tabsArray.entries()) {
          if (index === clickedIndex) {
            tab.classList.add('active');
            tab.setAttribute('aria-hidden', 'false');
            tab.setAttribute('tabindex', '0');
            clickedLink.setAttribute('aria-selected', 'true');
            clickedLink.classList.add('active');
          } else {
            tab.classList.remove('active');
            tab.setAttribute('aria-hidden', 'true');
            tab.setAttribute('tabindex', '-1');
            const otherLink = linksArray[index] as HTMLElement;
            otherLink.classList.remove('active');
            otherLink.setAttribute('aria-selected', 'false');
          }
        }
      }
    }
  }

  override render() {
    return html`
          <nav class="tab-component__nav">
            <ul class="tab-component__list" role="tablist">
              <li class="tab-component__listItem">
                <a
                  id="tab-1"
                  class="tab-component__link active"
                  role="tab"
                  href="#"
                  aria-selected="true"
                  aria-hidden="false"
                  aria-controls="tabpanel-1"
                  @click="${(event: Event) => this.activateTab(event)}"
                  title="${globalConfig.THOUGHT_PROCESS_LABEL}"
                >
                ${globalConfig.THOUGHT_PROCESS_LABEL}
                </a>
              </li>
              <li class="tab-component__listItem">
                <a 
                  id="tab-2"
                  class="tab-component__link"
                  role="tab"
                  href="#"
                  aria-selected="false"
                  aria-hidden="true"
                  aria-controls="tabpanel-2"
                  @click="${(event: Event) => this.activateTab(event)}"
                  title="${globalConfig.SUPPORT_CONTEXT_LABEL}"
                >
                ${globalConfig.SUPPORT_CONTEXT_LABEL}
                </a>
              </li>
              <li class="tab-component__listItem">
                <a
                  id="tab-3"
                  class="tab-component__link"
                  role="tab"
                  href="#"
                  aria-selected="false"
                  aria-hidden="true"
                  aria-controls="tabpanel-3"
                  @click="${(event: Event) => this.activateTab(event)}"
                  title="${globalConfig.CITATIONS_LABEL}"
                >
                ${globalConfig.CITATIONS_LABEL}
                </a>
              </li>
            </ul>
          </nav>
          <div class="tab-component__content">
            <div id="tabpanel-1" class="tab-component__tab active" role="tabpanel" tabindex="0" aria-labelledby="tab-1">
              <h3 class="subheadline--small">${globalConfig.THOUGHT_PROCESS_LABEL}</h3>
              <div class="tab-component__innerContainer">
              ${
                this.chatThoughts
                  ? html` <p class="tab-component__paragraph">${unsafeHTML(this.chatThoughts)}</p> `
                  : ''
              }
              </div> 
            </div>
            <div id="tabpanel-2" class="tab-component__tab" role="tabpanel" aria-labelledby="tab-2" tabindex="-1">
              <h3 class="subheadline--small">${globalConfig.SUPPORT_CONTEXT_LABEL}</h3>
              <ul class="defaults__list always-row">
                ${this.chatDataPoints?.map((dataPoint) => html` <li class="defaults__listItem">${dataPoint}</li> `)}
              </ul>
          </div>
          <div id="tabpanel-3" class="aside__tab" role="tabpanel" tabindex="-1" aria-labelledby="tab-3">
              ${this.chatCitations}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'tab-component': TabComponent;
  }
}
