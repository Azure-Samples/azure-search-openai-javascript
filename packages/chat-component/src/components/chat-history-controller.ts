import { html, type TemplateResult } from 'lit';
import { globalConfig, MAX_CHAT_HISTORY } from '../config/global-config.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

import iconHistory from '../../public/svg/history-icon.svg?raw';
import iconHistoryDismiss from '../../public/svg/history-dismiss-icon.svg?raw';
import iconUp from '../../public/svg/chevron-up-icon.svg?raw';

import { injectable } from 'inversify';
import {
  container,
  type ChatActionController,
  type ChatThreadController,
  ControllerType,
  ComposableReactiveControllerBase,
} from './composable.js';

const CHATHISTORY_FEATURE_FLAG = 'showChatHistory';

@injectable()
export class ChatHistoryActionButton extends ComposableReactiveControllerBase implements ChatActionController {
  constructor() {
    super();
    this.getShowChatHistory = this.getShowChatHistory.bind(this);
    this.setShowChatHistory = this.setShowChatHistory.bind(this);
  }

  getShowChatHistory() {
    return this.context.getState(CHATHISTORY_FEATURE_FLAG);
  }

  setShowChatHistory(value: boolean) {
    this.context.setState(CHATHISTORY_FEATURE_FLAG, value);
  }

  render(isDisabled: boolean) {
    if (this.context.interactionModel === 'ask') {
      return html``;
    }

    const showChatHistory = this.getShowChatHistory();
    return html`
      <chat-action-button
        .label="${showChatHistory ? globalConfig.HIDE_CHAT_HISTORY_LABEL : globalConfig.SHOW_CHAT_HISTORY_LABEL}"
        actionId="chat-history-button"
        @click="${() => this.setShowChatHistory(!showChatHistory)}"
        .isDisabled="${isDisabled}"
        .svgIcon="${showChatHistory ? iconHistoryDismiss : iconHistory}"
      >
      </chat-action-button>
    `;
  }
}

@injectable()
export class ChatHistoryController extends ComposableReactiveControllerBase implements ChatThreadController {
  static CHATHISTORY_ID = 'ms-azoaicc:history';

  private _chatHistory: ChatThreadEntry[] = [];

  constructor() {
    super();
    this.getShowChatHistory = this.getShowChatHistory.bind(this);
  }

  getShowChatHistory() {
    return this.context.getState(CHATHISTORY_FEATURE_FLAG);
  }

  override hostConnected() {
    const chatHistory = localStorage.getItem(ChatHistoryController.CHATHISTORY_ID);
    if (chatHistory) {
      // decode base64 string and then parse it
      const history = JSON.parse(decodeURIComponent(atob(chatHistory)));

      // find last 5 user messages indexes
      const lastUserMessagesIndexes = history
        .map((entry, index) => {
          if (entry.isUserMessage) {
            return index;
          }
        })
        .filter((index) => index !== undefined)
        .slice(-MAX_CHAT_HISTORY);

      // trim everything before the first user message
      const trimmedHistory = lastUserMessagesIndexes.length === 0 ? history : history.slice(lastUserMessagesIndexes[0]);

      this._chatHistory = trimmedHistory;
    }
  }

  save(currentChat: ChatThreadEntry[]): void {
    const newChatHistory = [...this._chatHistory, ...currentChat];
    // encode to base64 string and then save it
    localStorage.setItem(
      ChatHistoryController.CHATHISTORY_ID,
      btoa(encodeURIComponent(JSON.stringify(newChatHistory))),
    );
  }

  reset(): void {
    this._chatHistory = [];
  }

  merge(thread: ChatThreadEntry[]): ChatThreadEntry[] {
    // include the history from the previous session if the user has enabled the chat history
    return [...this._chatHistory, ...thread];
  }

  render(threadRenderer: (thread: ChatThreadEntry[]) => TemplateResult) {
    const showChatHistory = this.getShowChatHistory();
    if (!showChatHistory) {
      return html``;
    }

    return html`
      <div class="chat-history__container">
        ${threadRenderer(this._chatHistory)}
        <div class="chat-history__footer">
          ${unsafeSVG(iconUp)}
          ${globalConfig.CHAT_HISTORY_FOOTER_TEXT.replace(globalConfig.CHAT_MAX_COUNT_TAG, MAX_CHAT_HISTORY)}
          ${unsafeSVG(iconUp)}
        </div>
      </div>
    `;
  }
}

container.bind<ChatActionController>(ControllerType.ChatAction).to(ChatHistoryActionButton);
container.bind<ChatThreadController>(ControllerType.ChatThread).to(ChatHistoryController);
