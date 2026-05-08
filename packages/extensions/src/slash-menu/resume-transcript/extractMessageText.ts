/**
 * Extracts plain text from one persisted session message content payload.
 *
 * @param content Session message content.
 * @returns Joined text blocks.
 */
export function extractMessageText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((block): block is { type: string; text?: string } => typeof block === "object" && block !== null && "type" in block)
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text ?? "")
    .join("\n");
}
