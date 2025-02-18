import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { type TextItem } from 'pdfjs-dist/types/src/display/api.js';
import { type ContentPage } from '../document.js';

export async function extractTextFromPdf(data: Buffer): Promise<ContentPage[]> {
  const pages: ContentPage[] = [];
  const pdf = await pdfjs.getDocument(new Uint8Array(data)).promise;
  let offset = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    let previousY = 0;
    const text = textContent.items
      .filter((item) => 'str' in item)
      .map((item) => {
        const textItem = item as TextItem;
        const y = textItem.transform[5];
        let textContent = textItem.str;
        if (y !== previousY && previousY !== 0) {
          // If the Y coordinate changes, we're on a new line
          textContent = '\n' + textContent;
        }
        previousY = y;
        return textContent;
      })
      .join('');

    pages.push({ content: text + '\n', offset, page: i });
    offset += text.length;
  }
  return pages;
}
