import { type BaseLogger } from 'pino';
import { getBlobNameFromFile } from './blob-storage.js';
import { type ContentPage, type ContentSection, type Section } from './document.js';

const SENTENCE_ENDINGS = new Set(['.', '。', '．', '!', '?', '‼', '⁇', '⁈', '⁉']);
const WORD_BREAKS = new Set([',', '、', ';', ':', ' ', '(', ')', '[', ']', '{', '}', '\t', '\n']);
const MAX_SECTION_LENGTH = 1000;
const SENTENCE_SEARCH_LIMIT = 100;
const SECTION_OVERLAP = 100;

export class DocumentProcessor {
  formatHandlers = new Map<string, (data: Buffer) => Promise<ContentPage[]>>();

  constructor(private logger: BaseLogger) {}

  async createDocumentFromFile(filename: string, data: Buffer, type: string, category: string) {
    const pages = await this.extractText(data, type);
    const contentSections = this.splitPages(filename, pages);
    const sections = await this.createSections(filename, contentSections, category);
    return { filename, type, category, sections };
  }

  public registerFormatHandler(type: string, handler: (data: Buffer) => Promise<ContentPage[]>) {
    this.formatHandlers.set(type, handler);
  }

  private async extractText(data: Buffer, type: string): Promise<ContentPage[]> {
    const pages: ContentPage[] = [];

    const formatHandler = this.formatHandlers.get(type);
    if (!formatHandler) {
      throw new Error(`Unsupported file type: ${type}`);
    }

    const contentPages = await formatHandler(data);
    pages.push(...contentPages);

    return pages;
  }

  private async createSections(filename: string, contentSections: ContentSection[], category: string) {
    const fileId = filenameToId(filename);
    const sections: Section[] = [];

    for (const [index, { content, page }] of contentSections.entries()) {
      const section: Section = {
        id: `${fileId}-page-${page}-section-${index}`,
        content,
        category: category,
        sourcepage: getBlobNameFromFile(filename),
        sourcefile: filename,
      };

      sections.push(section);
    }
    return sections;
  }

  private splitPages(filename: string, pages: ContentPage[]): ContentSection[] {
    this.logger.debug(`Splitting '${filename}' into sections`);

    const findPage = (offset: number): number => {
      const pageCount = pages.length;
      for (let i = 0; i < pageCount - 1; i++) {
        if (offset >= pages[i].offset && offset < pages[i + 1].offset) {
          return pages[i].page;
        }
      }
      return pages[pageCount - 1].page;
    };

    const contentSections: ContentSection[] = [];
    const allText = pages.map((page) => page.content).join('');
    const length = allText.length;
    let start = 0;
    let end = length;

    if (end <= MAX_SECTION_LENGTH) {
      return [{ content: allText, page: findPage(0) }];
    }

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
          if (WORD_BREAKS.has(allText[end])) {
            lastWord = end;
          }
          end += 1;
        }
        if (end < length && !SENTENCE_ENDINGS.has(allText[end]) && lastWord > 0) {
          end = lastWord; // Fall back to at least keeping a whole word
        }
        if (end < length) {
          end += 1;
        }
      }

      // Try to find the start of the sentence or at least a whole word boundary
      lastWord = -1;
      while (
        start > 0 &&
        start > end - MAX_SECTION_LENGTH - 2 * SENTENCE_SEARCH_LIMIT &&
        !SENTENCE_ENDINGS.has(allText[start])
      ) {
        if (WORD_BREAKS.has(allText[start])) {
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
      contentSections.push({ page: findPage(start), content: sectionText });

      const lastTableStart = sectionText.lastIndexOf('<table');
      if (lastTableStart > 2 * SENTENCE_SEARCH_LIMIT && lastTableStart > sectionText.lastIndexOf('</table')) {
        // If the section ends with an unclosed table, we need to start the next section with the table.
        // If table starts inside SENTENCE_SEARCH_LIMIT, we ignore it, as that will cause an infinite loop for tables longer than MAX_SECTION_LENGTH
        // If last table starts inside SECTION_OVERLAP, keep overlapping
        const page = findPage(start);
        this.logger.debug(
          `Section ends with unclosed table, starting next section with the table at page ${page} offset ${start} table start ${lastTableStart}`,
        );
        start = Math.min(end - SECTION_OVERLAP, start + lastTableStart);
      } else {
        start = end - SECTION_OVERLAP;
      }
    }

    if (start + SECTION_OVERLAP < end) {
      contentSections.push({ content: allText.slice(start, end), page: findPage(start) });
    }

    return contentSections;
  }
}

function filenameToId(filename: string) {
  const filenameAscii = filename.replaceAll(/[^\w-]/g, '_');
  const filenameHash = Buffer.from(filename, 'utf8').toString('hex');
  return `file-${filenameAscii}-${filenameHash}`;
}
