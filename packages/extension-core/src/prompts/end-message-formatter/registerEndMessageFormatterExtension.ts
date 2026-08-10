import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { runChild } from "@nexus/shared/child-process/runChild.js";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const END_MESSAGE_FORMATTER_PATH = resolve(
  __dirname,
  "end-message-formatter.md",
);

/**
 * Rewrites the last assistant message to ASD-STE-100.
 *
 * Loads the end-message-formatter prompt as frontmatter, prepends it to the
 * assistant message text, and asks the LLM to rewrite the message according
 * to those instructions.
 *
 * @param pi Pi extension API.
 */
export function registerEndMessageFormatterExtension(pi: ExtensionAPI): void {
  pi.on("message_end", async (event, ctx) => {
    if (event.message.role !== "assistant") return;
    if (event.message.content.startsWith("[END_MESSAGE_FORMATTER_RAN]")) return;

    const formatterPrompt = readFileSync(END_MESSAGE_FORMATTER_PATH, "utf-8");
    const combinedPrompt = `${formatterPrompt}\n\n---\n\n${event.message.content}`;

    const output = await runChild(ctx.cwd, combinedPrompt);

    const formatted = output || `Error: end-message formatter failed to produce output.\n\nOriginal message:\n${event.message.content}`;

    event.message.content = `[END_MESSAGE_FORMATTER_RAN] ${formatted}`;
  });
}
