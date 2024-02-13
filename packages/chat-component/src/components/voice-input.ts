import { injectable } from 'inversify';
import { container, type ChatInputController, ControllerType, ComposableReactiveControllerBase } from './composable.js';
import { html } from 'lit';

@injectable()
export class VoiceInputController extends ComposableReactiveControllerBase implements ChatInputController {
  position = 'right';

  render(handleInput: (event: CustomEvent<InputValue>) => void) {
    return html`<voice-input-button @on-voice-input="${handleInput}" />`;
  }
}

container.bind<ChatInputController>(ControllerType.ChatInput).to(VoiceInputController);
