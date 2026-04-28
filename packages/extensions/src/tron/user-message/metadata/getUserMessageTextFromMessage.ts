/**
 * Extracts plain text from a user agent message.
 *
 * @param message Agent message-like object.
 * @returns Concatenated user text content.
 */
export function getUserMessageTextFromMessage(message: any): string {
  if (message?.role !== "user") return "";
  const content = message.content;
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((part) => part?.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("");
}
