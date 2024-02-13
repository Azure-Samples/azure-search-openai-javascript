/* eslint-disable unicorn/template-indent */
import { injectable } from 'inversify';
import {
  container,
  lazyMultiInject,
  type ChatSectionController,
  type CitationController,
  ControllerType,
  ComposableReactiveControllerBase,
} from './composable.js';
import { html } from 'lit';
import { globalConfig } from '../config/global-config.js';

import iconClose from '../../public/svg/close-icon.svg?raw';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

@injectable()
export class ChatDebugThoughtProcessController
  extends ComposableReactiveControllerBase
  implements ChatSectionController
{
  constructor() {
    super();
    this.close = this.close.bind(this);
  }

  @lazyMultiInject(ControllerType.Citation)
  citationControllers: CitationController[] | undefined;

  override hostConnected() {
    if (this.citationControllers) {
      for (const controller of this.citationControllers) {
        controller.attach(this.host, this.context);
      }
    }
  }

  handleCitationClick(event: CustomEvent): void {
    event?.preventDefault();
    this.context.selectedCitation = event?.detail?.citation;

    this.context.setState('showCitations', true);
  }

  renderChatEntryTabContent(entry: ChatThreadEntry) {
    return html`
      <tab-component
        .tabs="${[
          {
            id: 'tab-thought-process',
            label: globalConfig.THOUGHT_PROCESS_LABEL,
          },
          {
            id: 'tab-support-context',
            label: globalConfig.SUPPORT_CONTEXT_LABEL,
          },
          {
            id: 'tab-citations',
            label: globalConfig.CITATIONS_TAB_LABEL,
          },
        ] as TabContent[]}"
        .selectedTabId="${this.selectedAsideTab}"
      >
        <div slot="tab-thought-process" class="tab-component__content">
          ${entry && entry.thoughts
            ? html` <p class="tab-component__paragraph">${unsafeHTML(entry.thoughts)}</p> `
            : ''}
        </div>
        <div slot="tab-support-context" class="tab-component__content">
          ${entry && entry.dataPoints
            ? html`
                <teaser-list-component
                  .alwaysRow="${true}"
                  .teasers="${entry.dataPoints.map((d) => {
                    return { description: d };
                  })}"
                ></teaser-list-component>
              `
            : ''}
        </div>
        ${entry && entry.citations
          ? html`
              <div slot="tab-citations" class="tab-component__content">
                <citation-list
                  .citations="${entry.citations}"
                  .label="${globalConfig.CITATIONS_LABEL}"
                  .selectedCitation="${this.context.selectedCitation}"
                  @on-citation-click="${this.handleCitationClick}"
                ></citation-list>
                ${this.context.selectedCitation
                  ? this.citationControllers?.map((component) =>
                      component.render(
                        this.context.selectedCitation,
                        `${this.context.apiUrl}/content/${this.context.selectedCitation.text}`,
                      ),
                    )
                  : ''}
              </div>
            `
          : ''}
      </tab-component>
    `;
  }

  get isEnabled() {
    return this.isShowingThoughtProcess;
  }

  public close() {
    this.isShowingThoughtProcess = false;
    this.context.setState('showCitations', false);
    this.context.selectedChatEntry = undefined;
  }

  get isShowingThoughtProcess() {
    return this.context.getState('showThoughtProcess') || this.context.getState('showCitations');
  }

  set isShowingThoughtProcess(value: boolean) {
    this.context.setState('showThoughtProcess', value);
  }

  get selectedAsideTab() {
    if (this.context.getState('showCitations')) {
      return 'tab-citations';
    }

    return 'tab-thought-process';
  }

  render() {
    return html`
      <aside class="aside" data-testid="aside-thought-process">
        <div class="aside__header">
          <chat-action-button
            .label="${globalConfig.HIDE_THOUGH_PROCESS_BUTTON_LABEL_TEXT}"
            actionId="chat-hide-thought-process"
            @click="${this.close}"
            .svgIcon="${iconClose}"
          >
          </chat-action-button>
        </div>
        ${this.renderChatEntryTabContent(this.context.selectedChatEntry as ChatThreadEntry)}
      </aside>
    `;
  }
}

container.bind<ChatSectionController>(ControllerType.ChatSection).to(ChatDebugThoughtProcessController);
