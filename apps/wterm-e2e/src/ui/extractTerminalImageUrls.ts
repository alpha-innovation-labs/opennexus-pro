const IMAGE_URL_PATTERN = /https?:\/\/\S+?(?:\.png|\.jpg|\.jpeg|\.webp|\.gif)(?=\s|$)/giu;

/**
 * Extracts image URLs printed by terminal applications.
 *
 * @param text Terminal text.
 * @returns Image URLs found in the text.
 */
export function extractTerminalImageUrls(text: string): string[] {
  return [...text.matchAll(IMAGE_URL_PATTERN)].map((match) => match[0]);
}
