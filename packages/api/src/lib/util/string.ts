/**
 * Replace newline and carriage return characters with spaces.
 * @param {string} s The input string.
 * @returns {string} The input string with newline and carriage return characters replaced with spaces.
 * @example
 * removeNewlines('Hello\nworld\r\n!');
 * // output: 'Hello world !'
 */
export function removeNewlines(s: string = ''): string {
  return s.replaceAll('\n', ' ').replaceAll('\r', ' ');
}
