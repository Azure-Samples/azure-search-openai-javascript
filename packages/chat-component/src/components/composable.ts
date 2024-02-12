import { injectable, Container } from 'inversify';
import { html, type ReactiveControllerHost, type TemplateResult } from 'lit';
import getDecorators from 'inversify-inject-decorators';

export const container = new Container();
export const { lazyMultiInject } = getDecorators(container);

export const ComponentType = {
  ChatInputComponent: Symbol.for('ChatInputComponent'),
  ChatInputFooterComponent: Symbol.for('ChatInputFooterComponent'),
  ChatEntryActionButtonComponent: Symbol.for('ChatEntryActionButtonComponent'),
};

export interface ComposableComponent {
  attach: (host: ReactiveControllerHost) => void;
}

export interface ChatInputComponent extends ComposableComponent {
  position: 'left' | 'right' | 'top';
  render: (
    handleInput: (event: CustomEvent<InputValue>) => void,
    isChatStarted: boolean,
    interactionModel: 'ask' | 'chat',
  ) => TemplateResult;
}

export interface ChatInputFooterComponent extends ComposableComponent {
  render: (handleClick: (event: Event) => void, isChatStarted: boolean) => TemplateResult;
}

export interface ChatEntryActionButtonComponent extends ComposableComponent {
  attach: (host: ReactiveControllerHost) => void;
  render: (entry: ChatThreadEntry, isDisabled: boolean, handleClick: (event: Event) => void) => TemplateResult;
}

// Add a default component since inversify currently doesn't seem to support optional bindings
// and bindings fail if no component is provided
@injectable()
export class DefaultEmptyComponent {
  render() {
    return html``;
  }
}

@injectable()
export class DefaultInputComponent extends DefaultEmptyComponent implements ChatInputComponent {
  position: 'left' | 'right' | 'top' = 'left';
}

@injectable()
export class DefaultFooterComponent extends DefaultEmptyComponent implements ChatInputFooterComponent {}

container.bind<ChatInputComponent>(ComponentType.ChatInputComponent).to(DefaultInputComponent);
container.bind<ChatInputFooterComponent>(ComponentType.ChatInputFooterComponent).to(DefaultFooterComponent);
