/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable unicorn/template-indent */
import { LitElement, html } from 'lit';
import DOMPurify from 'dompurify';
import { customElement, property, query } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { chatHttpOptions, globalConfig, requestOptions } from './config/global-config.js';
import { getAPIResponse } from './core/http/index.js';
import { parseStreamedMessages } from './core/parser/index.js';
import { mainStyle } from './style.js';
import { getTimestamp, processText } from './utils/index.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';

// TODO: allow host applications to customize these icons

import iconLightBulb from '../public/svg/lightbulb-icon.svg?raw';
import iconDelete from '../public/svg/delete-icon.svg?raw';
import iconSuccess from '../public/svg/success-icon.svg?raw';
import iconCopyToClipboard from '../public/svg/copy-icon.svg?raw';
import iconSend from '../public/svg/send-icon.svg?raw';
import iconClose from '../public/svg/close-icon.svg?raw';
import iconCancel from '../public/svg/cancel-icon.svg?raw';
import iconQuestion from '../public/svg/bubblequestion-icon.svg?raw';
import iconSpinner from '../public/svg/spinner-icon.svg?raw';
import iconMicOff from '../public/svg/mic-icon.svg?raw';
import iconMicOn from '../public/svg/mic-record-on-icon.svg?raw';

import { marked } from 'marked';

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
  // --

  @property({ type: String, attribute: 'data-input-position' })
  inputPosition = 'sticky';

  @property({ type: String, attribute: 'data-interaction-model' })
  interactionModel: 'ask' | 'chat' = 'chat';

  @property({ type: String, attribute: 'data-api-url' })
  apiUrl = chatHttpOptions.url;

  @property({ type: String, attribute: 'data-use-stream', converter: (value) => value?.toLowerCase() === 'true' })
  useStream: boolean = chatHttpOptions.stream;

  @property({ type: String, attribute: 'data-overrides', converter: (value) => JSON.parse(value || '{}') })
  overrides: RequestOverrides = {};

  //--

  @property({ type: String })
  currentQuestion = '';

  @query('#question-input')
  questionInput!: HTMLInputElement;

  @query('#chat-list-footer')
  chatFooter!: HTMLElement;

  // Default prompts to display in the chat
  @property({ type: Boolean })
  isDisabled = false;

  @property({ type: Boolean })
  isChatStarted = false;

  @property({ type: Boolean })
  isResetInput = false;

  // The program is awaiting response from API
  @property({ type: Boolean })
  isAwaitingResponse = false;

  // Show error message to the end-user, if API call fails
  @property({ type: Boolean })
  hasAPIError = false;

  // Has the response been copied to the clipboard
  @property({ type: Boolean })
  isResponseCopied = false;

  // Is showing thought process panel
  @property({ type: Boolean })
  isShowingThoughtProcess = false;

  @property({ type: Boolean })
  canShowThoughtProcess = false;

  // some browsers may not support SpeechRecognition https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition#browser_compatibility
  @property({ type: Boolean })
  showVoiceInput = (window.SpeechRecognition || window.webkitSpeechRecognition) !== undefined;

  @property({ type: Boolean })
  enableVoiceListening = false;

  speechRecognition = undefined;

  // api response
  apiResponse = {} as BotResponse | Response;
  // These are the chat bubbles that will be displayed in the chat
  chatThread: ChatThreadEntry[] = [];
  hasDefaultPromptsEnabled: boolean = globalConfig.IS_DEFAULT_PROMPTS_ENABLED && !this.isChatStarted;
  defaultPrompts: string[] = globalConfig.DEFAULT_PROMPTS;
  defaultPromptsHeading: string = globalConfig.DEFAULT_PROMPTS_HEADING;
  chatButtonLabelText: string = globalConfig.CHAT_BUTTON_LABEL_TEXT;
  chatThoughts: string | null = '';
  chatDataPoints: string[] = [];

  abortController: AbortController = new AbortController();
  // eslint-disable-next-line unicorn/no-abusive-eslint-disable

  chatRequestOptions: ChatRequestOptions = requestOptions;
  chatHttpOptions: ChatHttpOptions = chatHttpOptions;

  selectedAsideTab: 'tab-thought-process' | 'tab-support-context' | 'tab-citations' = 'tab-thought-process';

  // Is currently processing the response from the API
  // This is used to show the cancel button
  isProcessingResponse = false;

  static override styles = [mainStyle];

  // debounce dispatching must-scroll event
  debounceScrollIntoView(): void {
    let timeout: any = 0;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (this.chatFooter) {
        this.chatFooter.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  }
  // Send the question to the Open AI API and render the answer in the chat
  // Add a message to the chat, when the user or the API sends a message
  async processApiResponse({ message, isUserMessage }: { message: string; isUserMessage: boolean }) {
    const citations: Citation[] = [];
    const followingSteps: string[] = [];
    const followupQuestions: string[] = [];
    // Get the timestamp for the message
    const timestamp = getTimestamp();
    const updateChatWithMessageOrChunk = async (part: string, isChunk: boolean) => {
      if (isChunk) {
        // we need to prepare an empty instance of the chat message so that we can start populating it
        this.chatThread = [
          ...this.chatThread,
          {
            text: [{ value: '', followingSteps: [] }],
            followupQuestions: [],
            citations: [],
            timestamp: timestamp,
            isUserMessage,
          },
        ];

        this.isProcessingResponse = true;

        const result = await parseStreamedMessages({
          chatThread: this.chatThread,
          signal: this.abortController.signal,
          apiResponseBody: (this.apiResponse as Response).body,
          onChunkRead: () => {
            // NOTE: this function is called whenever we mutate sub-properties of the array
            // so we need to trigger a re-render
            this.requestUpdate('chatThread');
          },
          onCancel: () => {
            this.isProcessingResponse = false;
            // TODO: show a message to the user that the response has been cancelled
          },
        });

        // this will be processing thought process only with streaming enabled
        this.chatThoughts = result.thoughts;
        this.chatDataPoints = result.data_points;
        this.canShowThoughtProcess = true;

        this.isProcessingResponse = false;
        // NOTE: for whatever reason, Lit doesn't re-render when we update isProcessingResponse property
        // so we need to trigger a re-render manually
        this.requestUpdate('isProcessingResponse');
        return true;
      }

      this.chatThread = [
        ...this.chatThread,
        {
          text: [
            {
              value: part,
              followingSteps,
            },
          ],
          followupQuestions,
          citations: [...new Set(citations)],
          timestamp: timestamp,
          isUserMessage,
        },
      ];
      return true;
    };

    // Check if message is a bot message to process citations and follow-up questions
    if (isUserMessage) {
      updateChatWithMessageOrChunk(message, false);
    } else {
      if (this.useStream) {
        await updateChatWithMessageOrChunk(message, true);
      } else {
        // non-streamed response
        const processedText = processText(message, [citations, followingSteps, followupQuestions]);
        message = processedText.replacedText;
        // Push all lists coming from processText to the corresponding arrays
        citations.push(...(processedText.arrays[0] as unknown as Citation[]));
        followingSteps.push(...(processedText.arrays[1] as string[]));
        followupQuestions.push(...(processedText.arrays[2] as string[]));
        updateChatWithMessageOrChunk(message, false);
      }
    }
  }

  handleVoiceInput(event: Event): void {
    event.preventDefault();
    if (!this.speechRecognition) {
      this.speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

      this.speechRecognition.continous = true;
      this.speechRecognition.lang = 'en-US';

      this.speechRecognition.onresult = (event) => {
        let input = '';
        for (const result of event.results) {
          input += `${result[0].transcript}`;
        }
        this.questionInput.value = DOMPurify.sanitize(input);
        this.currentQuestion = this.questionInput.value;
      };

      this.speechRecognition.addEventListener('error', (event) => {
        this.speechRecognition.stop();
        console.log(`Speech recognition error detected: ${event.error} - ${event.message}`);
      });
    }

    this.enableVoiceListening = !this.enableVoiceListening;
    if (this.enableVoiceListening) {
      this.speechRecognition.start();
    } else {
      this.speechRecognition.stop();
    }
  }

  // Handle the click on a default prompt
  handleDefaultPromptClick(question: string, event?: Event): void {
    event?.preventDefault();
    this.questionInput.value = DOMPurify.sanitize(question);
    this.hideThoughtProcess(event!);
    this.currentQuestion = this.questionInput.value;
  }

  async handleCitationClick(sourceUrl: string, event: Event): Promise<void> {
    if (sourceUrl?.endsWith('.md')) {
      event?.preventDefault();

      if (!this.isShowingThoughtProcess) {
        this.selectedAsideTab = 'tab-citations';
        this.showThoughtProcess();
      }

      const response = await fetch(sourceUrl);
      if (response.ok) {
        // highlight the clicked citation to make it clear which is being previewed
        const citationsList = this.shadowRoot?.querySelectorAll(
          '.aside .items__list.citations .items__listItem--citation',
        );

        if (citationsList) {
          const citationsArray = [...citationsList];
          const clickedIndex = citationsArray.findIndex((citation) => {
            const link = citation.querySelector('a');
            return link?.href === sourceUrl;
          });

          for (const citation of citationsList) {
            const index = citationsArray.indexOf(citation);
            if (index === clickedIndex) {
              citation.classList.add('active');
            } else {
              citation.classList.remove('active');
            }
          }
        }

        // update the markdown previewer with the content of the clicked citation
        const previewer = this.shadowRoot?.querySelector('#citation-previewer');
        if (previewer) {
          const markdownContent = await response.text();
          previewer.innerHTML = DOMPurify.sanitize(marked.parse(markdownContent));
        }
      }
    }
  }

  // Handle the click on the chat button and send the question to the API
  async handleUserChatSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const question = DOMPurify.sanitize(this.questionInput.value);
    if (question) {
      this.currentQuestion = question;
      try {
        const type = this.interactionModel;
        // Remove default prompts
        this.isChatStarted = true;
        this.hasDefaultPromptsEnabled = false;
        // Disable the input field and submit button while waiting for the API response
        this.isDisabled = true;
        // clear out errors
        this.hasAPIError = false;
        // Show loading indicator while waiting for the API response
        this.isAwaitingResponse = true;
        if (type === 'chat') {
          this.processApiResponse({ message: question, isUserMessage: true });
        }

        this.apiResponse = await getAPIResponse(
          {
            ...this.chatRequestOptions,
            overrides: {
              ...this.chatRequestOptions.overrides,
              ...this.overrides,
            },
            question,
            type,
          },
          {
            // use defaults
            ...this.chatHttpOptions,

            // override if the user has provided different values
            url: this.apiUrl,
            stream: this.useStream,
          },
        );

        this.questionInput.value = '';
        this.isAwaitingResponse = false;
        this.isDisabled = false;
        this.isResetInput = false;
        const response = this.apiResponse as BotResponse;
        // adds thought process support when streaming is disabled
        if (!this.useStream) {
          this.chatThoughts = response.choices[0].message.context?.thoughts ?? '';
          this.chatDataPoints = response.choices[0].message.context?.data_points ?? [];
          this.canShowThoughtProcess = true;
        }
        await this.processApiResponse({
          message: this.useStream ? '' : response.choices[0].message.content,
          isUserMessage: false,
        });
      } catch (error_: Error) {
        console.error(error_);

        const chatError = {
          message: error_?.code === 400 ? globalConfig.INVALID_REQUEST_ERROR : globalConfig.API_ERROR_MESSAGE,
        };

        if (this.isProcessingResponse) {
          const processingThread = this.chatThread.at(-1);
          processingThread.error = chatError;
        } else {
          this.chatThread = [
            ...this.chatThread,
            {
              error: chatError,
              text: [],
              timestamp: getTimestamp(),
              isUserMessage: false,
            },
          ];
        }

        this.handleAPIError();
      }
    }
  }

  // Reset the input field and the current question
  resetInputField(event: Event): void {
    event.preventDefault();
    this.questionInput.value = '';
    this.currentQuestion = '';
    this.isResetInput = false;
  }

  // Reset the chat and show the default prompts
  resetCurrentChat(event: Event): void {
    this.isChatStarted = false;
    this.chatThread = [];
    this.isDisabled = false;
    this.hasDefaultPromptsEnabled = true;
    this.isResponseCopied = false;
    this.hideThoughtProcess(event);
    this.handleUserChatCancel(event);
  }

  // Show the default prompts when enabled
  showDefaultPrompts(event: Event): void {
    if (!this.hasDefaultPromptsEnabled) {
      this.resetCurrentChat(event);
    }
  }

  // Handle the change event on the input field
  handleOnInputChange(): void {
    this.isResetInput = !!this.questionInput.value;
  }

  // Handle API error
  handleAPIError(): void {
    this.hasAPIError = true;
    this.isDisabled = false;
    this.isAwaitingResponse = false;
    this.isProcessingResponse = false;
  }

  // Copy response to clipboard
  copyResponseToClipboard(): void {
    const response = this.chatThread.at(-1)?.text.at(-1)?.value as string;
    navigator.clipboard.writeText(response);
    this.isResponseCopied = true;
  }

  // Stop generation
  handleUserChatCancel(event: Event): any {
    event?.preventDefault();
    this.isProcessingResponse = false;
    this.abortController.abort();

    // we have to reset the abort controller so that we can use it again
    this.abortController = new AbortController();
  }

  handleShowThoughtProcess(event: Event): void {
    event?.preventDefault();
    this.selectedAsideTab = 'tab-thought-process';
    this.showThoughtProcess();
  }

  // show thought process aside
  showThoughtProcess(): void {
    this.isShowingThoughtProcess = true;
    this.shadowRoot?.querySelector('#overlay')?.classList.add('active');
    this.shadowRoot?.querySelector('#chat__containerWrapper')?.classList.add('aside-open');
  }

  // hide thought process aside
  hideThoughtProcess(event: Event): void {
    event.preventDefault();
    this.isShowingThoughtProcess = false;
    this.shadowRoot?.querySelector('#chat__containerWrapper')?.classList.remove('aside-open');
    this.shadowRoot?.querySelector('#overlay')?.classList.remove('active');
  }
  // display active tab content
  // this is basically a tab component
  // and it would be ideal to decouple it from the chat component
  activateTab(event: Event): void {
    event.preventDefault();
    const clickedLink = event.target as HTMLElement;
    const linksNodeList = this.shadowRoot?.querySelectorAll('.aside__link');

    if (linksNodeList) {
      const linksArray = [...linksNodeList];
      const clickedIndex = linksArray.indexOf(clickedLink);
      const tabsNodeList = this.shadowRoot?.querySelectorAll('.aside__tab');

      if (tabsNodeList) {
        const tabsArray = [...tabsNodeList] as HTMLElement[];

        for (const [index, tab] of tabsArray.entries()) {
          if (index === clickedIndex) {
            tab.classList.add('active');
            tab.setAttribute('aria-hidden', 'false');
            tab.setAttribute('tabindex', '0');
            clickedLink.setAttribute('aria-selected', 'true');
            clickedLink.classList.add('active');
          } else {
            tab.classList.remove('active');
            tab.setAttribute('aria-hidden', 'true');
            tab.setAttribute('tabindex', '-1');
            const otherLink = linksArray[index] as HTMLElement;
            otherLink.classList.remove('active');
            otherLink.setAttribute('aria-selected', 'false');
          }
        }
      }
    }
  }
  // Render text entries in bubbles
  renderTextEntry(textEntry: ChatMessageText) {
    const entries = [html`<p class="chat__txt--entry">${unsafeHTML(textEntry.value)}</p>`];

    // render steps
    if (textEntry.followingSteps && textEntry.followingSteps.length > 0) {
      entries.push(
        html` <ul class="items__list steps">
          ${textEntry.followingSteps.map(
            (followingStep) => html` <li class="items__listItem--step">${unsafeHTML(followingStep)}</li> `,
          )}
        </ul>`,
      );
    }
    // scroll to the bottom of the chat
    if (this.isProcessingResponse) {
      this.debounceScrollIntoView();
    }
    return entries;
  }

  renderCitation(citations: Citation[] | undefined) {
    // render citations
    if (citations && citations.length > 0) {
      return html`
        <ol class="items__list citations">
          <h3 class="subheadline--small">${globalConfig.CITATIONS_LABEL}</h3>
          ${citations.map(
            (citation) => html`
              <li class="items__listItem--citation">
                <a
                  class="items__link"
                  href="${this.apiUrl}/content/${citation.text}"
                  data-testid="citation"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click="${(event: Event) =>
                    this.handleCitationClick(`${this.apiUrl}/content/${citation.text}`, event)}"
                  >${citation.ref}. ${citation.text}</a
                >
              </li>
            `,
          )}
        </ol>
      `;
    }
    return '';
  }

  renderFollowupQuestions(followupQuestions: string[] | undefined) {
    // render followup questions
    if (followupQuestions && followupQuestions.length > 0) {
      return html`
        <div class="items__listWrapper">
          ${unsafeSVG(iconQuestion)}
          <ul class="items__list followup">
            ${followupQuestions.map(
              (followupQuestion) => html`
                <li class="items__listItem--followup">
                  <a
                    class="items__link"
                    href="#"
                    @click="${(event: Event) => this.handleDefaultPromptClick(followupQuestion, event)}"
                    >${followupQuestion}?</a
                  >
                </li>
              `,
            )}
          </ul>
        </div>
      `;
    }
    return '';
  }

  renderError(error: { message: string }) {
    return html`<p class="chat__txt error">${error.message}</p>`;
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
      <button
        class="chatbox__button"
        data-testid="cancel-question-button"
        @click="${this.handleUserChatCancel}"
        title="${globalConfig.CHAT_CANCEL_BUTTON_LABEL_TEXT}"
      >
        ${unsafeSVG(iconCancel)}
      </button>`;

    return this.isProcessingResponse ? cancelChatButton : submitChatButton;
  }

  // Render the chat component as a web component
  override render() {
    return html`
      <div id="overlay" class="overlay"></div>
      <section id="chat__containerWrapper" class="chat__containerWrapper">
        <section class="chat__container" id="chat-container">
          ${this.isChatStarted
            ? html`
                <div class="chat__header">
                  <button
                    title="${globalConfig.RESET_CHAT_BUTTON_TITLE}"
                    class="button chat__header--button"
                    data-testid="chat-reset-button"
                    @click="${this.resetCurrentChat}"
                  >
                    <span class="chat__header--span">${globalConfig.RESET_CHAT_BUTTON_TITLE}</span>
                    ${unsafeSVG(iconDelete)}
                  </button>
                </div>
                <ul class="chat__list" id="chat-list" aria-live="assertive">
                  ${this.chatThread.map(
                    (message) => html`
                      <li class="chat__listItem ${message.isUserMessage ? 'user-message' : ''}">
                        <div class="chat__txt ${message.isUserMessage ? 'user-message' : ''}">
                          ${message.isUserMessage
                            ? ''
                            : html` <div class="chat__header">
                                <button
                                  title="${globalConfig.SHOW_THOUGH_PROCESS_BUTTON_LABEL_TEXT}"
                                  class="button chat__header--button"
                                  data-testid="chat-show-thought-process"
                                  @click="${this.handleShowThoughtProcess}"
                                  ?disabled="${this.isShowingThoughtProcess || !this.canShowThoughtProcess}"
                                >
                                  <span class="chat__header--span"
                                    >${globalConfig.SHOW_THOUGH_PROCESS_BUTTON_LABEL_TEXT}</span
                                  >

                                  ${unsafeSVG(iconLightBulb)}
                                </button>
                                <button
                                  title="${globalConfig.COPY_RESPONSE_BUTTON_LABEL_TEXT}"
                                  class="button chat__header--button"
                                  @click="${this.copyResponseToClipboard}"
                                  ?disabled="${this.isDisabled}"
                                >
                                  <span class="chat__header--span"
                                    >${this.isResponseCopied
                                      ? globalConfig.COPIED_SUCCESSFULLY_MESSAGE
                                      : globalConfig.COPY_RESPONSE_BUTTON_LABEL_TEXT}</span
                                  >
                                  ${this.isResponseCopied ? unsafeSVG(iconSuccess) : unsafeSVG(iconCopyToClipboard)}
                                </button>
                              </div>`}
                          ${message.text.map((textEntry) => this.renderTextEntry(textEntry))}
                          ${this.renderCitation(message.citations)}
                          ${this.renderFollowupQuestions(message.followupQuestions)}
                          ${message.error ? this.renderError(message.error) : ''}
                        </div>
                        <p class="chat__txt--info">
                          <span class="timestamp">${message.timestamp}</span>,
                          <span class="user">${message.isUserMessage ? 'You' : globalConfig.USER_IS_BOT}</span>
                        </p>
                      </li>
                    `,
                  )}
                </ul>
                <div class="chat__footer" id="chat-list-footer">
                  <!-- Do not delete this element. It is used for auto-scrolling -->
                </div>
              `
            : ''}
          ${this.isAwaitingResponse && !this.hasAPIError
            ? html`
                <p class="loading-text" aria-label="${globalConfig.LOADING_INDICATOR_TEXT}">
                  <span class="loading-icon">${unsafeSVG(iconSpinner)}</span>
                  <span class="loading-label">${globalConfig.LOADING_INDICATOR_TEXT}</span>
                </p>
              `
            : ''}
          <!-- Default prompts: use the variables above to edit the heading -->
          <div class="chat__container">
            <!-- Conditionally render default prompts based on hasDefaultPromptsEnabled -->
            ${this.hasDefaultPromptsEnabled
              ? html`
                  <div class="defaults__container">
                    <h1 class="headline">
                      ${this.interactionModel === 'chat'
                        ? this.title || globalConfig.DEFAULT_PROMPTS_HEADING_CHAT
                        : this.title || globalConfig.DEFAULT_PROMPTS_HEADING_ASK}
                    </h1>
                    <ul class="defaults__list">
                      ${this.defaultPrompts.map(
                        (prompt) => html`
                          <li class="defaults__listItem">
                            <a
                              role="button"
                              href="#"
                              class="defaults__button"
                              data-testid="default-question"
                              @click="${(event: Event) => this.handleDefaultPromptClick(prompt, event)}"
                            >
                              ${prompt}
                              <span class="defaults__span">${globalConfig.DEFAULT_PROMPTS_HEADING_ASK}</span>
                            </a>
                          </li>
                        `,
                      )}
                    </ul>
                  </div>
                `
              : ''}
          </div>
          <div class="chat__container"></div>
          <form
            id="chat-form"
            class="form__container ${this.inputPosition === 'sticky' ? 'form__container-sticky' : ''}"
          >
            <div class="chatbox__container container-col container-row">
              <div class="chatbox__input-container display-flex-grow container-row">
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
                ${this.showVoiceInput && !this.isResetInput
                  ? html` <button
                      title="${this.enableVoiceListening
                        ? globalConfig.CHAT_VOICE_REC_BUTTON_LABEL_TEXT
                        : globalConfig.CHAT_VOICE_BUTTON_LABEL_TEXT}"
                      class="chatbox__button voice__input ${this.enableVoiceListening ? 'recording' : 'not-recording'}"
                      ?disabled="${!this.showVoiceInput}"
                      @click="${this.handleVoiceInput}"
                    >
                      ${this.enableVoiceListening ? unsafeSVG(iconMicOn) : unsafeSVG(iconMicOff)}
                    </button>`
                  : ''}
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

            ${this.hasDefaultPromptsEnabled
              ? ''
              : html`<div class="chat__containerFooter">
                  <button type="button" @click="${this.showDefaultPrompts}" class="defaults__span button">
                    ${globalConfig.DISPLAY_DEFAULT_PROMPTS_BUTTON}
                  </button>
                </div>`}
          </form>
        </section>
        ${this.isShowingThoughtProcess
          ? html`
              <aside class="aside" data-testid="aside-thought-process">
                <div class="aside__header">
                  <button
                    title="${globalConfig.HIDE_THOUGH_PROCESS_BUTTON_LABEL_TEXT}"
                    class="button chat__header--button"
                    data-testid="chat-hide-thought-process"
                    @click="${this.hideThoughtProcess}"
                  >
                    <span class="chat__header--span">${globalConfig.HIDE_THOUGH_PROCESS_BUTTON_LABEL_TEXT}</span>
                    ${unsafeSVG(iconClose)}
                  </button>
                </div>
                <nav class="aside__nav">
                  <ul class="aside__list" role="tablist">
                    <li class="aside__listItem">
                      <a
                        id="tab-thought-process"
                        class="aside__link${this.selectedAsideTab === 'tab-thought-process' ? ' active' : ''}"
                        role="tab"
                        href="#"
                        aria-selected="${this.selectedAsideTab === 'tab-thought-process'}"
                        aria-hidden="${this.selectedAsideTab !== 'tab-thought-process'}"
                        aria-controls="tabpanel-1"
                        @click="${(event: Event) => this.activateTab(event)}"
                        title="${globalConfig.THOUGHT_PROCESS_LABEL}"
                      >
                      ${globalConfig.THOUGHT_PROCESS_LABEL}
                      </a>
                    </li>
                    <li class="aside__listItem">
                      <a 
                        id="tab-support-context"
                        class="aside__link${this.selectedAsideTab === 'tab-support-context' ? ' active' : ''}"
                        role="tab"
                        href="#"
                        aria-selected="${this.selectedAsideTab === 'tab-support-context'}"
                        aria-hidden="${this.selectedAsideTab !== 'tab-support-context'}"
                        aria-controls="tabpanel-2"
                        @click="${(event: Event) => this.activateTab(event)}"
                        title="${globalConfig.SUPPORT_CONTEXT_LABEL}"
                      >
                      ${globalConfig.SUPPORT_CONTEXT_LABEL}
                      </a>
                    </li>
                    <li class="aside__listItem">
                      <a
                        id="tab-citations"
                        class="aside__link${this.selectedAsideTab === 'tab-citations' ? ' active' : ''}"
                        role="tab"
                        href="#"
                        aria-selected="${this.selectedAsideTab === 'tab-citations'}"
                        aria-hidden="${this.selectedAsideTab !== 'tab-citations'}"
                        aria-controls="tabpanel-3"
                        @click="${(event: Event) => this.activateTab(event)}"
                        title="${globalConfig.CITATIONS_TAB_LABEL}"
                      >
                      ${globalConfig.CITATIONS_TAB_LABEL}
                      </a>
                    </li>
                  </ul>
                </nav>
                <div class="aside__content">
                  <div id="tabpanel-1" class="aside__tab${
                    this.selectedAsideTab === 'tab-thought-process' ? ' active' : ''
                  }" role="tabpanel" tabindex="${
                    this.selectedAsideTab === 'tab-thought-process' ? 0 : -1
                  }" aria-labelledby="tab-thought-process">
                    <h3 class="subheadline--small">${globalConfig.THOUGHT_PROCESS_LABEL}</h3>
                    <div class="aside__innerContainer">
                    ${this.chatThoughts ? html` <p class="aside__paragraph">${unsafeHTML(this.chatThoughts)}</p> ` : ''}
                    </div> 
                  </div>
                  <div id="tabpanel-2" class="aside__tab${
                    this.selectedAsideTab === 'tab-support-context' ? ' active' : ''
                  }" role="tabpanel" aria-labelledby="tab-support-context" tabindex="${
                    this.selectedAsideTab === 'tab-support-context' ? 0 : -1
                  }">
                    <h3 class="subheadline--small">${globalConfig.SUPPORT_CONTEXT_LABEL}</h3>
                    <ul class="defaults__list always-row">
                      ${this.chatDataPoints.map(
                        (dataPoint) => html` <li class="defaults__listItem">${dataPoint}</li> `,
                      )}
                    </ul>
                  </div>
                  <div id="tabpanel-3" class="aside__tab${
                    this.selectedAsideTab === 'tab-citations' ? ' active' : ''
                  }" role="tabpanel" tabindex="${
                    this.selectedAsideTab === 'tab-citations' ? 0 : -1
                  }" aria-labelledby="tab-citations">
                      ${this.renderCitation(this.chatThread.at(-1)?.citations)}
                      <div id="citation-previewer"></div>
                  </div>
                </div>
              </div>
            </aside>
          `
          : ''}
      </section>
    `;
  }
}
