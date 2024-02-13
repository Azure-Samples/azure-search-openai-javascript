import { html, type ReactiveControllerHost, type TemplateResult } from 'lit';
import { injectable, Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import { type ChatContextController } from '../chat-context.js';

export const container = new Container();
export const { lazyMultiInject } = getDecorators(container);

export const ControllerType = {
  ChatInput: Symbol.for('ChatInputController'),
  ChatInputFooter: Symbol.for('ChatInputFooterController'),
  ChatSection: Symbol.for('ChatSectionController'),
  ChatEntryAction: Symbol.for('ChatEntryActionController'),
  Citation: Symbol.for('CitationController'),
};

export interface ComposableReactiveController extends ReactiveController {
  attach: (host: ReactiveControllerHost, context: ChatContextController) => void;
}

@injectable()
export abstract class ComposableReactiveControllerBase implements ComposableReactiveController {
  protected host: ReactiveControllerHost;
  protected context: ChatContextController;

  attach(host: ReactiveControllerHost, context: ChatContextController) {
    this.host = host;
    this.context = context;
  }

  hostConnected() {}
  hostDisconnected() {}
}

export interface ChatInputController extends ComposableReactiveController {
  position: 'left' | 'right' | 'top';
  render: (handleInput: (event: CustomEvent<InputValue>) => void) => TemplateResult;
}

export interface ChatInputFooterController extends ComposableReactiveController {
  render: (handleClick: (event: Event) => void) => TemplateResult;
}

export interface ChatSectionController extends ComposableReactiveController {
  isEnabled: boolean;
  close: () => void;
  render: () => TemplateResult;
}

export interface ChatEntryActionController extends ComposableReactiveController {
  render: (entry: ChatThreadEntry, isDisabled: boolean) => TemplateResult;
}

export interface CitationController extends ComposableReactiveController {
  render: (citation: Citation, url: string) => TemplateResult;
}

// Add a default component since inversify currently doesn't seem to support optional bindings
// and bindings fail if no component is provided
@injectable()
export class DefaultController extends ComposableReactiveControllerBase {
  render() {
    return html``;
  }
}

@injectable()
export class DefaultInputController extends DefaultController implements ChatInputController {
  position: 'left' | 'right' | 'top' = 'left';
}

@injectable()
export class DefaultChatSectionController extends DefaultController implements ChatSectionController {
  isEnabled = false;
  close() {}
}

container.bind<ChatInputController>(ControllerType.ChatInput).to(DefaultInputController);
container.bind<ChatInputFooterController>(ControllerType.ChatInputFooter).to(DefaultController);
container.bind<ChatSectionController>(ControllerType.ChatSection).to(DefaultChatSectionController);
container.bind<ChatEntryActionController>(ControllerType.ChatEntryAction).to(DefaultController);
container.bind<CitationController>(ControllerType.Citation).to(DefaultController);
