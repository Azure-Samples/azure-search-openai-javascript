import { injectable } from 'inversify';
import {
  container,
  type ChatEntryActionController,
  ControllerType,
  ComposableReactiveControllerBase,
} from './composable.js';
import { html } from 'lit';
import { chatEntryToString } from '../utils/index.js';
import { globalConfig } from '../config/global-config.js';

import iconSuccess from '../../public/svg/success-icon.svg?raw';
import iconCopyToClipboard from '../../public/svg/copy-icon.svg?raw';

@injectable()
export class CopyToClipboardActionController
  extends ComposableReactiveControllerBase
  implements ChatEntryActionController
{
  private _isResponseCopied: boolean = false;

  set isResponseCopied(value: boolean) {
    this._isResponseCopied = value;
    this.host.requestUpdate();
  }

  get isResponseCopied() {
    return this._isResponseCopied;
  }

  // Copy response to clipboard
  copyResponseToClipboard(entry: ChatThreadEntry): void {
    const response = chatEntryToString(entry);

    navigator.clipboard.writeText(response);
    this.isResponseCopied = true;
  }

  render(entry: ChatThreadEntry, isDisabled: boolean) {
    return html`
      <chat-action-button
        .label="${globalConfig.COPY_RESPONSE_BUTTON_LABEL_TEXT}"
        .svgIcon="${this.isResponseCopied ? iconSuccess : iconCopyToClipboard}"
        .isDisabled="${isDisabled}"
        actionId="copy-to-clipboard"
        .tooltip="${this.isResponseCopied
          ? globalConfig.COPIED_SUCCESSFULLY_MESSAGE
          : globalConfig.COPY_RESPONSE_BUTTON_LABEL_TEXT}"
        @click="${() => this.copyResponseToClipboard(entry)}"
      ></chat-action-button>
    `;
  }
}

container.bind<ChatEntryActionController>(ControllerType.ChatEntryAction).to(CopyToClipboardActionController);
