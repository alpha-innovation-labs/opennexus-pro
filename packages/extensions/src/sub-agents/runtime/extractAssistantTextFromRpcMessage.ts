/**
 * Extracts assistant text from one RPC message payload.
 *
 * @param message RPC message payload.
 * @returns Flattened assistant text.
 */
export function extractAssistantTextFromRpcMessage(
  message: { content?: Array<{ type?: string; text?: string }> } | undefined,
): string {
  return message?.content
    ?.filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("\n")
    .trim() ?? "";
}
