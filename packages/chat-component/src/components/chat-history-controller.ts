import { type ReactiveController, type ReactiveControllerHost } from 'lit';
import { html } from 'lit';
import { globalConfig, MAX_CHAT_HISTORY } from '../config/global-config.js';

import iconHistory from '../../public/svg/history-icon.svg?raw';
import iconHistoryDismiss from '../../public/svg/history-dismiss-icon.svg?raw';

import './chat-action-button.js';

export class ChatHistoryController implements ReactiveController {
  host: ReactiveControllerHost;
  static CHATHISTORY_ID = 'ms-azoaicc:history';

  chatHistory: ChatThreadEntry[] = [];

  private _showChatHistory: boolean = false;

  get showChatHistory() {
    return this._showChatHistory;
  }

  set showChatHistory(value: boolean) {
    this._showChatHistory = value;
    this.host.requestUpdate();
  }

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }

  hostConnected() {
    const chatHistory = localStorage.getItem(ChatHistoryController.CHATHISTORY_ID);
    if (chatHistory) {
      // decode base64 string and then parse it
      const history = JSON.parse(atob(chatHistory));

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

      this.chatHistory = trimmedHistory;
    }
  }

  hostDisconnected() {
    // no-op
  }

  saveChatHistory(currentChat: ChatThreadEntry[]): void {
    const newChatHistory = [...this.chatHistory, ...currentChat];
    // encode to base64 string and then save it
    localStorage.setItem(ChatHistoryController.CHATHISTORY_ID, btoa(JSON.stringify(newChatHistory)));
  }

  handleChatHistoryButtonClick(event: Event) {
    event.preventDefault();
    this.showChatHistory = !this.showChatHistory;
  }

  renderHistoryButton(options: { disabled: boolean } | undefined) {
    return html`
      <chat-action-button
        .label="${this.showChatHistory ? globalConfig.HIDE_CHAT_HISTORY_LABEL : globalConfig.SHOW_CHAT_HISTORY_LABEL}"
        actionId="chat-history-button"
        @click="${(event) => this.handleChatHistoryButtonClick(event)}"
        .isDisabled="${options?.disabled}"
        .svgIcon="${this.showChatHistory ? iconHistoryDismiss : iconHistory}"
      >
      </chat-action-button>
    `;
  }
}
