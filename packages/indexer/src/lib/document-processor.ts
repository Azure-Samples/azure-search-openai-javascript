import { type BaseLogger } from 'pino';
import { getBlobNameFromFile } from './blob-storage.js';

export interface Document {
  filename: string;
  type: string;
  category: string;
  sections: Section[];
}

export interface Section {
  id: string;
  content: string;
  category: string;
  sourcepage: string;
  sourcefile: string;
  embedding?: number[];
}

export interface ContentPage {
  content: string;
  offset: number;
  page: number;
}

export interface ContentSection {
  content: string;
  page: number;
}

const MAX_SECTION_LENGTH = 1000;
const SENTENCE_SEARCH_LIMIT = 100;
const SECTION_OVERLAP = 100;

export class DocumentProcessor {
  constructor(private logger: BaseLogger) {}

  async createDocumentFromFile(filename: string, data: Buffer, type: string, category: string) {
    const pages = await this.extractText(data, type);
    const contentSections = this.splitText(filename, pages);
    const sections = await this.createSections(filename, contentSections, category);
    return { filename, type, category, sections };
  }

  private async extractText(data: Buffer, type: string): Promise<ContentPage[]> {
    const pages: ContentPage[] = [];
    if (type === 'text/plain' || type === 'text/markdown') {
      const text = data.toString('utf8');
      pages.push({ content: text, offset: 0, page: 0 });
    } else {
      // TODO: support other file types (PDF...)
      throw new Error(`Unsupported file type: ${type}`);
    }

    return pages;
  }

  private async createSections(filename: string, contentSections: ContentSection[], category: string) {
    const fileId = filenameToId(filename);
    const sections: Section[] = [];

    for (const [index, { content }] of contentSections.entries()) {
      const section: Section = {
        id: `${fileId}-section-${index}`,
        content,
        category: category,
        sourcepage: getBlobNameFromFile(filename),
        sourcefile: filename,
      };

      sections.push(section);
    }
    return sections;
  }

  // TODO: use langchain splitters: https://js.langchain.com/docs/modules/data_connection/document_transformers/text_splitters/code_splitter
  private splitText(filename: string, pages: ContentPage[]) {
    const SENTENCE_ENDINGS = new Set(['.', '!', '?']);
    const WORDS_BREAKS = new Set([',', ';', ':', ' ', '(', ')', '[', ']', '{', '}', '\t', '\n']);

    this.logger.debug(`Splitting '${filename}' into sections`);

    const findPage = (pages: ContentPage[], offset: number) =>
      pages.findIndex((page, index, array) => {
        const nextPage = array[index + 1];
        return !nextPage || (offset >= page.offset && offset < nextPage.offset);
      });

    const contentSections: ContentSection[] = [];
    const allText = pages.map((p) => p.content).join('');
    const length = allText.length;
    let start = 0;
    let end = length;
    while (start + SECTION_OVERLAP < length) {
      let lastWord = -1;
      end = start + MAX_SECTION_LENGTH;

      if (end > length) {
        end = length;
      } else {
        // Try to find the end of the sentence
        while (
          end < length &&
          end - start - MAX_SECTION_LENGTH < SENTENCE_SEARCH_LIMIT &&
          !SENTENCE_ENDINGS.has(allText[end])
        ) {
          if (WORDS_BREAKS.has(allText[end])) {
            lastWord = end;
          }
          end += 1;
        }
        if (end < length && !SENTENCE_ENDINGS.has(allText[end]) && lastWord > 0) {
          end = lastWord; // Fall back to at least keeping a whole word
        }
      }
      if (end < length) {
        end += 1;
      }

      // Try to find the start of the sentence or at least a whole word boundary
      lastWord = -1;
      while (
        start > 0 &&
        start > end - MAX_SECTION_LENGTH - 2 * SENTENCE_SEARCH_LIMIT &&
        !SENTENCE_ENDINGS.has(allText[start])
      ) {
        if (WORDS_BREAKS.has(allText[start])) {
          lastWord = start;
        }
        start -= 1;
      }
      if (!SENTENCE_ENDINGS.has(allText[start]) && lastWord > 0) {
        start = lastWord;
      }
      if (start > 0) {
        start += 1;
      }

      const sectionText = allText.slice(start, end);
      contentSections.push({ content: sectionText, page: findPage(pages, start) });

      const lastTableStart = sectionText.lastIndexOf('<table');
      if (lastTableStart > 2 * SENTENCE_SEARCH_LIMIT && lastTableStart > sectionText.lastIndexOf('</table')) {
        // If the section ends with an unclosed table, we need to start the next section with the table.
        // If table starts inside SENTENCE_SEARCH_LIMIT, we ignore it, as that will cause an infinite loop for tables longer than MAX_SECTION_LENGTH
        // If last table starts inside SECTION_OVERLAP, keep overlapping
        const page = findPage(pages, start);
        this.logger.debug(
          `Section ends with unclosed table, starting next section with the table at page ${page} offset ${start} table start ${lastTableStart}`,
        );
        start = Math.min(end - SECTION_OVERLAP, start + lastTableStart);
      } else {
        start = end - SECTION_OVERLAP;
      }
    }

    if (start + SECTION_OVERLAP < end) {
      contentSections.push({ content: allText.slice(start, end), page: findPage(pages, start) });
    }

    return contentSections;
  }
}

function filenameToId(filename: string) {
  const filenameAscii = filename.replaceAll(/[^\w-]/g, '_');
  const filenameHash = Buffer.from(filename, 'utf8').toString('hex');
  return `file-${filenameAscii}-${filenameHash}`;
}
