import { injectable } from 'inversify';
import {
  container,
  type ChatEntryActionController,
  ControllerType,
  ComposableReactiveControllerBase,
} from './composable.js';
import { html } from 'lit';
import { globalConfig } from '../config/global-config.js';
import iconLightBulb from '../../public/svg/lightbulb-icon.svg?raw';

@injectable()
export class DebugChatEntryActionController
  extends ComposableReactiveControllerBase
  implements ChatEntryActionController
{
  handleClick(event: Event, entry: ChatThreadEntry) {
    event.preventDefault();
    this.context.setState('showThoughtProcess', true);
    this.context.selectedChatEntry = entry;
  }

  render(entry: ChatThreadEntry, isDisabled: boolean) {
    const isShowingThoughtProcess = this.context.getState('showThoughtProcess');
    return html`
      <chat-action-button
        .label="${globalConfig.SHOW_THOUGH_PROCESS_BUTTON_LABEL_TEXT}"
        .svgIcon="${iconLightBulb}"
        actionId="chat-show-thought-process"
        .isDisabled="${isDisabled || isShowingThoughtProcess}"
        @click="${(event) => this.handleClick(event, entry)}"
      ></chat-action-button>
    `;
  }
}

container.bind<ChatEntryActionController>(ControllerType.ChatEntryAction).to(DebugChatEntryActionController);
