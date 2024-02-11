import { injectable, Container } from 'inversify';
import { type TemplateResult } from 'lit';
import { html } from 'lit';
export const container = new Container();

export const ComponentType = {
  ChatInputComponent: Symbol.for('ChatInputComponent'),
};

export class SetInputEvent extends CustomEvent<{ value: string }> {}

export interface ChatInputComponent {
  position: 'left' | 'right';
  render: (handleInput: (event: SetInputEvent) => void) => TemplateResult;
}

// Add a default component since inversify currently doesn't seem to support optional bindings
// and bindings fail if no component is provided
@injectable()
export class DefaultInputComponent implements ChatInputComponent {
  position = 'right';

  render() {
    return html``;
  }
}

container.bind<ChatInputComponent>(ComponentType.ChatInputComponent).to(DefaultInputComponent);
