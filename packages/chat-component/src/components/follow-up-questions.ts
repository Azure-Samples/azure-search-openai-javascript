import { injectable } from 'inversify';
import {
  container,
  type ChatEntryInlineInputController,
  ControllerType,
  ComposableReactiveControllerBase,
} from './composable.js';
import { html } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import iconQuestion from '../../public/svg/bubblequestion-icon.svg?raw';

@injectable()
export class FollowupQuestionsController
  extends ComposableReactiveControllerBase
  implements ChatEntryInlineInputController
{
  render(entry: ChatThreadEntry, handleInput: (input: string) => void) {
    const followupQuestions = entry.followupQuestions;
    // render followup questions
    // need to fix first after decoupling of teaserlist
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
                    data-testid="followUpQuestion"
                    @click="${() => handleInput(followupQuestion)}"
                    >${followupQuestion}</a
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
}

container.bind<ChatEntryInlineInputController>(ControllerType.ChatEntryInlineInput).to(FollowupQuestionsController);
