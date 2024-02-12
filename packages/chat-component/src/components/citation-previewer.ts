import { injectable } from 'inversify';
import { container, type CitationActionComponent, ComponentType } from './composable.js';
import { html } from 'lit';

@injectable()
export class CitationPreviewer implements CitationActionComponent {
  render(citation: Citation, url: string) {
    return html`<document-previewer url="${url}"></document-previewer>`;
  }
}

container.bind<CitationActionComponent>(ComponentType.CitationActionComponent).to(CitationPreviewer);
