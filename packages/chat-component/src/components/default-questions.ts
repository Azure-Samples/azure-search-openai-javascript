import { injectable } from 'inversify';
import { container, type ChatInputComponent, ComponentType, type ChatInputFooterComponent } from './composable.js';
import { globalConfig, teaserListTexts } from '../config/global-config.js';
import { html } from 'lit';

@injectable()
export class DefaultQuestionsInputComponent implements ChatInputComponent {
  position = 'top';

  isDefaultPromptsEnabled: boolean = globalConfig.IS_DEFAULT_PROMPTS_ENABLED;

  render(
    handleInput: (event: CustomEvent<InputValue>) => void,
    isChatStarted: boolean = false,
    interactionModel: 'ask' | 'chat' = 'ask',
  ) {
    const promptTemplate = html`
      <teaser-list-component
        .heading="${interactionModel === 'chat' ? teaserListTexts.HEADING_CHAT : teaserListTexts.HEADING_ASK}"
        .clickable="${true}"
        .actionLabel="${teaserListTexts.TEASER_CTA_LABEL}"
        @teaser-click="${handleInput}"
        .teasers="${teaserListTexts.DEFAULT_PROMPTS}"
      ></teaser-list-component>
    `;
    return this.isDefaultPromptsEnabled && !isChatStarted ? promptTemplate : html``;
  }
}

@injectable()
export class DefaultQuestionFooterComponent implements ChatInputFooterComponent {
  render(handleClick: (event: Event) => void, isChatStarted: boolean) {
    const footer = html`
      <div class="chat__containerFooter">
        <button type="button" @click="${handleClick}" class="defaults__span button">
          ${globalConfig.DISPLAY_DEFAULT_PROMPTS_BUTTON}
        </button>
      </div>
    `;

    return globalConfig.IS_DEFAULT_PROMPTS_ENABLED && !isChatStarted ? '' : footer;
  }
}

container.bind<ChatInputComponent>(ComponentType.ChatInputComponent).to(DefaultQuestionsInputComponent);
container.bind<ChatInputFooter>(ComponentType.ChatInputFooterComponent).to(DefaultQuestionFooterComponent);
