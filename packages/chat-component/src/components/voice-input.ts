import { injectable } from 'inversify';
import { container, type ChatInputComponent, ComponentType } from './composable.js';
import { html } from 'lit';

@injectable()
export class VoiceInputComponentProvider implements ChatInputComponent {
  position = 'right';

  render(handleInput: (event: CustomEvent<InputValue>) => void) {
    return html`<voice-input-button @on-voice-input="${handleInput}" />`;
  }
}

container.bind<ChatInputComponent>(ComponentType.ChatInputComponent).to(VoiceInputComponentProvider);
