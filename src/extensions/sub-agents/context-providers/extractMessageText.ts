/**
 * Extracts text blocks from Pi message content arrays.
 *
 * @param content Unknown message content array.
 * @returns Flattened text.
 */
export function extractMessageText(content: unknown[]): string {
  return content
    .filter((item: any) => item?.type === "text")
    .map((item: any) => item?.text ?? "")
    .join("\n");
}
