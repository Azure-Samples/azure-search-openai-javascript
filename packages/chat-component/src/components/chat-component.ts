/* eslint-disable unicorn/template-indent */
import { LitElement, html } from 'lit';
import DOMPurify from 'dompurify';
import { customElement, property, query, state } from 'lit/decorators.js';
import { chatHttpOptions, globalConfig, requestOptions } from '../config/global-config.js';
import { chatStyle } from '../styles/chat-component.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { chatEntryToString, newListWithEntryAtIndex } from '../utils/index.js';

// TODO: allow host applications to customize these icons

import iconDelete from '../../public/svg/delete-icon.svg?raw';
import iconCancel from '../../public/svg/cancel-icon.svg?raw';
import iconSend from '../../public/svg/send-icon.svg?raw';
import iconLogo from '../../public/branding/brand-logo.svg?raw';

import { ChatController } from './chat-controller.js';
import {
  lazyMultiInject,
  ControllerType,
  type ChatInputController,
  type ChatInputFooterController,
  type ChatSectionController,
  type ChatActionController,
  type ChatThreadController,
} from './composable.js';
import { ChatContextController } from './chat-context.js';

/**
 * A chat component that allows the user to ask questions and get answers from an API.
 * The component also displays default prompts that the user can click on to ask a question.
 * The component is built as a custom element that extends LitElement.
 *
 * Labels and other aspects are configurable via properties that get their values from the global config file.
 * @element chat-component
 * @fires chat-component#questionSubmitted - Fired when the user submits a question
 * @fires chat-component#defaultQuestionClicked - Fired when the user clicks on a default question
 * */

@customElement('chat-component')
export class ChatComponent extends LitElement {
  //--
  // Public attributes
  // -

  @property({ type: String, attribute: 'data-input-position' })
  inputPosition = 'sticky';

  @property({ type: String, attribute: 'data-interaction-model' })
  set interactionModel(value: 'ask' | 'chat') {
    this.chatContext.interactionModel = value || 'chat';
  }

  get interactionModel(): 'ask' | 'chat' {
    return this.chatContext.interactionModel;
  }

  @property({ type: String, attribute: 'data-api-url' })
  set apiUrl(value: string) {
    this.chatContext.apiUrl = value;
  }

  get apiUrl(): string {
    return this.chatContext.apiUrl;
  }

  @property({ type: String, attribute: 'data-custom-branding', converter: (value) => value?.toLowerCase() === 'true' })
  isCustomBranding: boolean = globalConfig.IS_CUSTOM_BRANDING;

  @property({ type: String, attribute: 'data-use-stream', converter: (value) => value?.toLowerCase() === 'true' })
  useStream: boolean = chatHttpOptions.stream;

  @property({ type: String, attribute: 'data-approach' })
  approach = requestOptions.approach;

  @property({ type: String, attribute: 'data-overrides', converter: (value) => JSON.parse(value || '{}') })
  overrides: RequestOverrides = {};

  @property({ type: String, attribute: 'data-custom-styles', converter: (value) => JSON.parse(value || '{}') })
  customStyles: any = {};

  //--

  @property({ type: String })
  currentQuestion = '';

  @query('#question-input')
  questionInput!: HTMLInputElement;

  @state()
  isDisabled = false;

  set isChatStarted(value: boolean) {
    this.chatContext.isChatStarted = value;
  }

  get isChatStarted(): boolean {
    return this.chatContext.isChatStarted;
  }

  @state()
  isResetInput = false;

  private chatController = new ChatController(this);
  private chatContext = new ChatContextController(this);

  // These are the chat bubbles that will be displayed in the chat
  chatThread: ChatThreadEntry[] = [];

  static override styles = [chatStyle];

  @lazyMultiInject(ControllerType.ChatInput)
  chatInputComponents: ChatInputController[] | undefined;

  @lazyMultiInject(ControllerType.ChatInputFooter)
  chatInputFooterComponets: ChatInputFooterController[] | undefined;

  @lazyMultiInject(ControllerType.ChatSection)
  chatSectionControllers: ChatSectionController[] | undefined;

  @lazyMultiInject(ControllerType.ChatAction)
  chatActionControllers: ChatActionController[] | undefined;

  @lazyMultiInject(ControllerType.ChatThread)
  chatThreadControllers: ChatThreadController[] | undefined;

  public constructor() {
    super();
    this.setQuestionInputValue = this.setQuestionInputValue.bind(this);
    this.renderChatThread = this.renderChatThread.bind(this);
  }

  // Lifecycle method that runs when the component is first connected to the DOM
  override connectedCallback(): void {
    super.connectedCallback();
    if (this.chatInputComponents) {
      for (const component of this.chatInputComponents) {
        component.attach(this, this.chatContext);
      }
    }
    if (this.chatInputFooterComponets) {
      for (const component of this.chatInputFooterComponets) {
        component.attach(this, this.chatContext);
      }
    }
    if (this.chatSectionControllers) {
      for (const component of this.chatSectionControllers) {
        component.attach(this, this.chatContext);
      }
    }
    if (this.chatActionControllers) {
      for (const component of this.chatActionControllers) {
        component.attach(this, this.chatContext);
      }
    }
    if (this.chatThreadControllers) {
      for (const component of this.chatThreadControllers) {
        component.attach(this, this.chatContext);
      }
    }
  }

  override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    // The following block is only necessary when you want to override the component from settings in the outside.
    // Remove this block when not needed, considering that updated() is a LitElement lifecycle method
    // that may be used by other components if you update this code.
    if (changedProperties.has('customStyles')) {
      this.style.setProperty('--c-accent-high', this.customStyles.AccentHigh);
      this.style.setProperty('--c-accent-lighter', this.customStyles.AccentLight);
      this.style.setProperty('--c-accent-dark', this.customStyles.AccentDark);
      this.style.setProperty('--c-text-color', this.customStyles.TextColor);
      this.style.setProperty('--c-light-gray', this.customStyles.BackgroundColor);
      this.style.setProperty('--c-dark-gray', this.customStyles.ForegroundColor);
      this.style.setProperty('--c-base-gray', this.customStyles.FormBackgroundColor);
      this.style.setProperty('--radius-base', this.customStyles.BorderRadius);
      this.style.setProperty('--border-base', this.customStyles.BorderWidth);
      this.style.setProperty('--font-base', this.customStyles.FontBaseSize);
    }
  }
  // Send the question to the Open AI API and render the answer in the chat

  setQuestionInputValue(value: string): void {
    this.questionInput.value = DOMPurify.sanitize(value || '');
    this.currentQuestion = this.questionInput.value;
  }

  handleInput(event: CustomEvent<InputValue>): void {
    event?.preventDefault();
    this.setQuestionInputValue(event?.detail?.value);
  }

  handleCitationClick(event: CustomEvent): void {
    event?.preventDefault();
    const citation = event?.detail?.citation;
    const chatThreadEntry = event?.detail?.chatThreadEntry;
    if (citation) {
      this.chatContext.selectedCitation = citation;
    }
    if (chatThreadEntry) {
      this.chatContext.selectedChatEntry = chatThreadEntry;
    }
    this.chatContext.setState('showCitations', true);
  }

  getMessageContext(): Message[] {
    if (this.interactionModel === 'ask') {
      return [];
    }

    let thread: ChatThreadEntry[] = [...this.chatThread];
    if (this.chatThreadControllers) {
      for (const controller of this.chatThreadControllers) {
        thread = controller.merge(thread);
      }
    }

    const messages: Message[] = thread.map((entry) => {
      return {
        content: chatEntryToString(entry),
        role: entry.isUserMessage ? 'user' : 'assistant',
      };
    });

    return messages;
  }

  // Handle the click on the chat button and send the question to the API
  async handleUserChatSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.collapseAside(event);
    const question = DOMPurify.sanitize(this.questionInput.value);
    this.isChatStarted = true;

    await this.chatController.generateAnswer(
      {
        ...requestOptions,
        approach: this.approach,
        overrides: {
          ...requestOptions.overrides,
          ...this.overrides,
        },
        question,
        type: this.interactionModel,
        messages: this.getMessageContext(),
      },
      {
        // use defaults
        ...chatHttpOptions,

        // override if the user has provided different values
        url: this.apiUrl,
        stream: this.useStream,
      },
    );

    if (this.interactionModel === 'chat') {
      this.saveChatThreads(this.chatThread);
    }

    this.questionInput.value = '';
    this.isResetInput = false;
  }

  // Reset the input field and the current question
  resetInputField(event: Event): void {
    event.preventDefault();
    this.questionInput.value = '';
    this.currentQuestion = '';
    this.isResetInput = false;
  }

  saveChatThreads(chatThread: ChatThreadEntry[]): void {
    if (this.chatThreadControllers) {
      for (const component of this.chatThreadControllers) {
        component.save(chatThread);
      }
    }
  }

  // Reset the chat and show the default prompts
  resetCurrentChat(event: Event): void {
    this.isChatStarted = false;
    this.chatThread = [];
    this.isDisabled = false;
    this.chatContext.selectedCitation = undefined;
    this.chatController.reset();
    this.saveChatThreads(this.chatThread);
    this.collapseAside(event);
    this.handleUserChatCancel(event);
  }

  // Handle the change event on the input field
  handleOnInputChange(): void {
    this.isResetInput = !!this.questionInput.value;
  }

  // Stop generation
  handleUserChatCancel(event: Event): any {
    event?.preventDefault();
    this.chatController.cancelRequest();
  }

  // hide thought process aside
  collapseAside(event: Event): void {
    event?.preventDefault();
    if (this.chatSectionControllers) {
      for (const component of this.chatSectionControllers) {
        component.close();
      }
    }
  }

  renderChatOrCancelButton() {
    const submitChatButton = html`<button
      class="chatbox__button"
      data-testid="submit-question-button"
      @click="${this.handleUserChatSubmit}"
      title="${globalConfig.CHAT_BUTTON_LABEL_TEXT}"
      ?disabled="${this.isDisabled}"
    >
      ${unsafeSVG(iconSend)}
    </button>`;
    const cancelChatButton = html`<button
      class="chatbox__button"
      data-testid="cancel-question-button"
      @click="${this.handleUserChatCancel}"
      title="${globalConfig.CHAT_CANCEL_BUTTON_LABEL_TEXT}"
    >
      ${unsafeSVG(iconCancel)}
    </button>`;

    return this.chatController.isProcessingResponse ? cancelChatButton : submitChatButton;
  }

  override willUpdate(): void {
    this.isDisabled = this.chatController.generatingAnswer;

    if (this.chatController.processingMessage) {
      const processingEntry = this.chatController.processingMessage as ChatThreadEntry;
      const index = this.chatThread.findIndex((entry) => entry.id === processingEntry.id);

      this.chatThread =
        index > -1
          ? newListWithEntryAtIndex(this.chatThread, index, processingEntry)
          : [...this.chatThread, processingEntry];
    }
  }

  renderChatThread(chatThread: ChatThreadEntry[]) {
    return html`<chat-thread-component
      .chatThread="${chatThread}"
      .isDisabled="${this.isDisabled}"
      .isProcessingResponse="${this.chatController.isProcessingResponse}"
      .selectedCitation="${this.chatContext.selectedCitation}"
      .isCustomBranding="${this.isCustomBranding}"
      .svgIcon="${iconLogo}"
      .context="${this.chatContext}"
      @on-citation-click="${this.handleCitationClick}"
      @on-input="${this.handleInput}"
    >
    </chat-thread-component>`;
  }

  renderChatInputComponents(position: 'left' | 'right') {
    return this.isResetInput || this.chatInputComponents === undefined
      ? ''
      : this.chatInputComponents
          .filter((component) => component.position === position)
          .map((component) => component.render(this.setQuestionInputValue));
  }

  // Render the chat component as a web component
  override render() {
    const isAsideEnabled = this.chatSectionControllers?.some((controller) => controller.isEnabled);
    return html`
      <div id="overlay" class="overlay ${isAsideEnabled ? 'active' : ''}"></div>
      <section id="chat__containerWrapper" class="chat__containerWrapper ${isAsideEnabled ? 'aside-open' : ''}">
        ${this.isCustomBranding && !this.isChatStarted
          ? html` <chat-stage
              svgIcon="${iconLogo}"
              pagetitle="${globalConfig.BRANDING_HEADLINE}"
              url="${globalConfig.BRANDING_URL}"
            >
            </chat-stage>`
          : ''}
        <section class="chat__container" id="chat-container">
          ${this.isChatStarted
            ? html`
                <div class="chat__header--thread">
                  ${this.chatActionControllers?.map((component) => component.render(this.isDisabled))}
                  <chat-action-button
                    .label="${globalConfig.RESET_CHAT_BUTTON_TITLE}"
                    actionId="chat-reset-button"
                    @click="${this.resetCurrentChat}"
                    .svgIcon="${iconDelete}"
                  >
                  </chat-action-button>
                </div>
                ${this.chatThreadControllers?.map((component) => component.render(this.renderChatThread))}
                ${this.renderChatThread(this.chatThread)}
              `
            : ''}
          ${this.chatController.isAwaitingResponse
            ? html`<loading-indicator label="${globalConfig.LOADING_INDICATOR_TEXT}"></loading-indicator>`
            : ''}
          <!-- Teaser List with Default Prompts -->
          <div class="chat__container">${this.renderChatInputComponents('top')}</div>
          <form
            id="chat-form"
            class="form__container ${this.inputPosition === 'sticky' ? 'form__container-sticky' : ''}"
          >
            <div class="chatbox__container container-col container-row">
              <div class="chatbox__input-container display-flex-grow container-row">
                ${this.renderChatInputComponents('left')}
                <input
                  class="chatbox__input display-flex-grow"
                  data-testid="question-input"
                  id="question-input"
                  placeholder="${globalConfig.CHAT_INPUT_PLACEHOLDER}"
                  aria-labelledby="chatbox-label"
                  id="chatbox"
                  name="chatbox"
                  type="text"
                  :value=""
                  ?disabled="${this.isDisabled}"
                  autocomplete="off"
                  @keyup="${this.handleOnInputChange}"
                />
                ${this.renderChatInputComponents('right')}
              </div>
              ${this.renderChatOrCancelButton()}
              <button
                title="${globalConfig.RESET_BUTTON_TITLE_TEXT}"
                class="chatbox__button--reset"
                .hidden="${!this.isResetInput}"
                type="reset"
                id="resetBtn"
                title="Clear input"
                @click="${this.resetInputField}"
              >
                ${globalConfig.RESET_BUTTON_LABEL_TEXT}
              </button>
            </div>

            ${this.chatInputFooterComponets?.map((component) =>
              component.render(this.resetCurrentChat, this.isChatStarted),
            )}
          </form>
        </section>
        ${isAsideEnabled ? this.chatSectionControllers?.map((component) => component.render()) : ''}
      </section>
    `;
  }
}
