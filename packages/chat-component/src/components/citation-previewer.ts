import { injectable } from 'inversify';
import { container, type CitationController, ControllerType, ComposableReactiveControllerBase } from './composable.js';
import { html } from 'lit';

@injectable()
export class CitationPreviewer extends ComposableReactiveControllerBase implements CitationController {
  render(citation: Citation, url: string) {
    return html`<document-previewer url="${url}"></document-previewer>`;
  }
}

container.bind<CitationController>(ControllerType.Citation).to(CitationPreviewer);
