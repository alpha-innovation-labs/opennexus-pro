import type { SDKMessage } from "@cursor/sdk";

/**
 * Writes assistant text blocks from a Cursor SDK stream event to stdout.
 *
 * @param event Cursor SDK stream event.
 */
export function writeAssistantBlocks(event: SDKMessage): void {
  if (event.type !== "assistant") return;
  for (const block of event.message.content) {
    if (block.type === "text") process.stdout.write(block.text);
  }
}
