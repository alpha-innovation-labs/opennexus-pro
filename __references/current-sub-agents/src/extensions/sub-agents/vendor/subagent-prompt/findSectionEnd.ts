import { DATE_HEADER, SKILLS_HEADER } from "./headers.js";

const DEFAULT_NEXT_HEADERS = [SKILLS_HEADER, DATE_HEADER];

/**
 * Finds the end offset for a prompt section bounded by known headers.
 *
 * @param prompt Full system prompt text.
 * @param startIndex Index immediately after the section header.
 * @param nextHeaders Optional list of headers that may terminate the section.
 * @returns End index for the current section.
 */
export function findSectionEnd(
  prompt: string,
  startIndex: number,
  nextHeaders: string[] = DEFAULT_NEXT_HEADERS,
): number {
  let endIndex = prompt.length;
  for (const header of nextHeaders) {
    const index = prompt.indexOf(header, startIndex);
    if (index !== -1 && index < endIndex) {
      endIndex = index;
    }
  }
  return endIndex;
}
