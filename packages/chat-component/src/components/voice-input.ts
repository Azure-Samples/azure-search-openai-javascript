import { injectable } from 'inversify';
import { container, type ChatInputController, ControllerType, ComposableReactiveControllerBase } from './composable.js';
import { html } from 'lit';

@injectable()
export class VoiceInputController extends ComposableReactiveControllerBase implements ChatInputController {
  position = 'right';

  render(handleInput: (input: string) => void) {
    return html`<voice-input-button @on-voice-input="${(event) => handleInput(event?.detail?.value)}" />`;
  }
}

container.bind<ChatInputController>(ControllerType.ChatInput).to(VoiceInputController);
