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

// TODO: allow host applications to customize these icons
import iconLightBulb from '../public/svg/lightbulb-icon.svg?inline';
import iconDelete from '../public/svg/delete-icon.svg?inline';
import iconDoubleCheck from '../public/svg/doublecheck-icon.svg?inline';
import iconCopyToClipboard from '../public/svg/copy-icon.svg?inline';
import iconSend from '../public/svg/send-icon.svg?inline';
import iconClose from '../public/svg/close-icon.svg?inline';

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

  chatRequestOptions: ChatRequestOptions = requestOptions;
  chatHttpOptions: ChatHttpOptions = chatHttpOptions;

  static override styles = [mainStyle];

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

        const result = await parseStreamedMessages({
          chatThread: this.chatThread,
          apiResponseBody: (this.apiResponse as Response).body,
          visit: () => {
            // NOTE: this function is called whenever we mutate sub-properties of the array
            this.requestUpdate('chatThread');
          },
          // this will be processing thought process only with streaming enabled
        });
        this.chatThoughts = result.thoughts;
        this.chatDataPoints = result.data_points;
        this.canShowThoughtProcess = true;
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

  // Handle the click on a default prompt
  handleDefaultPromptClick(question: string, event?: Event): void {
    event?.preventDefault();
    this.questionInput.value = DOMPurify.sanitize(question);
    this.currentQuestion = this.questionInput.value;
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
      } catch (error) {
        console.error(error);
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
  }

  // Copy response to clipboard
  copyResponseToClipboard(): void {
    const response = this.chatThread.at(-1)?.text.at(-1)?.value as string;
    navigator.clipboard.writeText(response);
    this.isResponseCopied = true;
  }

  // show thought process aside
  showThoughtProcess(event: Event): void {
    event.preventDefault();
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
    const entries = [html`<p>${unsafeHTML(textEntry.value)}</p>`];

    // render steps
    if (textEntry.followingSteps && textEntry.followingSteps.length > 0) {
      entries.push(
        html` <ol class="items__list steps">
          ${textEntry.followingSteps.map(
            (followingStep) => html` <li class="items__listItem--step">${unsafeHTML(followingStep)}</li> `,
          )}
        </ol>`,
      );
    }

    return entries;
  }

  renderCitation(citations: Citation[] | undefined) {
    // render citations
    if (citations && citations.length > 0) {
      return html`
        <h3 class="subheadline--small">Citations</h3>
        <ol class="items__list">
          ${citations.map(
            (citation) => html`
              <li class="items__listItem--citation">
                <a
                  class="items__link"
                  href="${this.apiUrl}/content/${citation.text}"
                  target="_blank"
                  rel="noopener noreferrer"
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
    if (followupQuestions && followupQuestions.length > 0) {
      return html`
        <h3 class="subheadline--small">You may also want to ask...</h3>
        <ol class="items__list followup">
          ${followupQuestions.map(
            (followupQuestion) => html`
              <li class="items__listItem--followup">
                <a
                  class="items__link"
                  href="#"
                  @click="${(event: Event) => this.handleDefaultPromptClick(followupQuestion, event)}"
                  >${followupQuestion}</a
                >
              </li>
            `,
          )}
        </ol>
      `;
    }

    return '';
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
                    @click="${this.resetCurrentChat}"
                  >
                    <span class="chat__header--span">${globalConfig.RESET_CHAT_BUTTON_TITLE}</span>
                    <img src="${iconDelete}" alt="${globalConfig.RESET_CHAT_BUTTON_TITLE}" width="12" height="12" />
                  </button>
                </div>
                <ul class="chat__list" aria-live="assertive">
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
                                  @click="${this.showThoughtProcess}"
                                  ?disabled="${this.isShowingThoughtProcess || !this.canShowThoughtProcess}"
                                >
                                  <span class="chat__header--span"
                                    >${globalConfig.SHOW_THOUGH_PROCESS_BUTTON_LABEL_TEXT}</span
                                  >
                                  <img
                                    src="${iconLightBulb}"
                                    alt="${globalConfig.SHOW_THOUGH_PROCESS_BUTTON_LABEL_TEXT}"
                                    width="12"
                                    height="12"
                                  />
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
                                  <img
                                    src="${this.isResponseCopied ? iconDoubleCheck : iconCopyToClipboard}"
                                    alt="${globalConfig.COPY_RESPONSE_BUTTON_LABEL_TEXT}"
                                    width="12"
                                    height="12"
                                  />
                                </button>
                              </div>`}
                          ${message.text.map((textEntry) => this.renderTextEntry(textEntry))}
                          ${this.renderFollowupQuestions(message.followupQuestions)}
                          ${this.renderCitation(message.citations)}
                        </div>
                        <p class="chat__txt--info">
                          <span class="timestamp">${message.timestamp}</span>,
                          <span class="user">${message.isUserMessage ? 'You' : globalConfig.USER_IS_BOT}</span>
                        </p>
                      </li>
                    `,
                  )}
                  ${this.hasAPIError
                    ? html`
                        <li class="chat__listItem">
                          <p class="chat__txt error">${globalConfig.API_ERROR_MESSAGE}</p>
                        </li>
                      `
                    : ''}
                </ul>
              `
            : ''}
          ${this.isAwaitingResponse && !this.hasAPIError
            ? html`
                <div
                  id="loading-indicator"
                  class="loading-skeleton"
                  aria-label="${globalConfig.LOADING_INDICATOR_TEXT}"
                >
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
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
                              @click="${(event: Event) => this.handleDefaultPromptClick(prompt, event)}"
                            >
                              ${prompt}
                              <span class="defaults__span">Ask now</span>
                            </a>
                          </li>
                        `,
                      )}
                    </ul>
                  </div>
                `
              : ''}
          </div>
          <form
            id="chat-form"
            class="form__container ${this.inputPosition === 'sticky' ? 'form__container-sticky' : ''}"
          >
            <div class="chatbox__container container-col container-row">
              <input
                class="chatbox__input"
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
              <button
                class="chatbox__button"
                @click="${this.handleUserChatSubmit}"
                title="${globalConfig.CHAT_BUTTON_LABEL_TEXT}"
                ?disabled="${this.isDisabled}"
              >
                <img src="${iconSend}" alt="${globalConfig.CHAT_BUTTON_LABEL_TEXT}" width="25" height="25" />
              </button>
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
              <aside class="aside">
                <div class="aside__header">
                  <button
                    title="${globalConfig.HIDE_THOUGH_PROCESS_BUTTON_LABEL_TEXT}"
                    class="button chat__header--button"
                    @click="${this.hideThoughtProcess}"
                  >
                    <span class="chat__header--span">${globalConfig.HIDE_THOUGH_PROCESS_BUTTON_LABEL_TEXT}</span>
                    <img
                      src="${iconClose}"
                      alt="${globalConfig.HIDE_THOUGH_PROCESS_BUTTON_LABEL_TEXT}"
                      width="12"
                      height="12"
                    />
                  </button>
                </div>
                <nav class="aside__nav">
                  <ul class="aside__list" role="tablist">
                    <li class="aside__listItem">
                      <a
                        id="tab-1"
                        class="aside__link active"
                        role="tab"
                        href="#"
                        aria-selected="true"
                        aria-hidden="false"
                        aria-controls="tabpanel-1"
                        @click="${(event: Event) => this.activateTab(event)}"
                        title="${globalConfig.THOUGHT_PROCESS_LABEL}"
                      >
                      ${globalConfig.THOUGHT_PROCESS_LABEL}
                      </a>
                    </li>
                    <li class="aside__listItem">
                      <a 
                        id="tab-2"
                        class="aside__link"
                        role="tab"
                        href="#"
                        aria-selected="false"
                        aria-hidden="true"
                        aria-controls="tabpanel-2"
                        @click="${(event: Event) => this.activateTab(event)}"
                        title="${globalConfig.SUPPORT_CONTEXT_LABEL}"
                      >
                      ${globalConfig.SUPPORT_CONTEXT_LABEL}
                      </a>
                    </li>
                    <li class="aside__listItem">
                      <a
                        id="tab-3"
                        class="aside__link"
                        role="tab"
                        href="#"
                        aria-selected="false"
                        aria-hidden="true"
                        aria-controls="tabpanel-3"
                        @click="${(event: Event) => this.activateTab(event)}"
                        title="${globalConfig.CITATIONS_LABEL}"
                      >
                      ${globalConfig.CITATIONS_LABEL}
                      </a>
                    </li>
                  </ul>
                </nav>
                <div class="aside__content">
                  <div id="tabpanel-1" class="aside__tab active" role="tabpanel" tabindex="0" aria-labelledby="tab-1">
                    <h3 class="subheadline--small">${globalConfig.THOUGHT_PROCESS_LABEL}</h3>
                    <div class="aside__innerContainer">
                    ${this.chatThoughts ? html` <p class="aside__paragraph">${unsafeHTML(this.chatThoughts)}</p> ` : ''}
                    </div> 
                  </div>
                  <div id="tabpanel-2" class="aside__tab" role="tabpanel" aria-labelledby="tab-2" tabindex="-1">
                    <h3 class="subheadline--small">${globalConfig.SUPPORT_CONTEXT_LABEL}</h3>
                    <ul class="defaults__list always-row">
                      ${this.chatDataPoints.map(
                        (dataPoint) => html` <li class="defaults__listItem">${dataPoint}</li> `,
                      )}
                    </ul>
                  </div>
                  <div id="tabpanel-3" class="aside__tab" role="tabpanel" tabindex="-1" aria-labelledby="tab-3">
                      ${this.renderCitation(this.chatThread.at(-1)?.citations)}
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
