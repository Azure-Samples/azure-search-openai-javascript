import { type ContentPage } from '../document.js';

export async function extractText(data: Buffer): Promise<ContentPage[]> {
  const text = data.toString('utf8');
  return [{ content: text, offset: 0, page: 0 }];
}
