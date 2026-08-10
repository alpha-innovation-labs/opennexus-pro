import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { runChild } from "@nexus/runtime/shared/child-process/runChild";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setAssistantMessageUpdateHook } from "@nexus/pi-platform/assistantMessageHook";
const __dirname = dirname(fileURLToPath(import.meta.url));

const END_MESSAGE_FORMATTER_PATH = resolve(
  __dirname,
  "end-message-formatter.md",
);

/**
 * Installs a streaming hook that reformats assistant messages in real time.
 *
 * Uses Pi's `AssistantMessageComponent.updateContent` hook to intercept every
 * streaming update. When the stream finishes, the final content is sent to the
 * end-message-formatter LLM and the result replaces the displayed text.
 *
 * @param pi Pi extension API.
 */
export function registerEndMessageFormatterExtension(_pi: ExtensionAPI): void {
  const formatterPrompt = readFileSync(END_MESSAGE_FORMATTER_PATH, "utf-8");
  let pendingMessage: { content: unknown } | null = null;
  let pendingText: string = "";
  let firstUserMessage: string | undefined = undefined;

  /**
   * Collects text chunks as they stream in.
   */
  function onStreamUpdate(_component: unknown, message: { content?: Array<{ type: string; text?: string }> }): void {
    const textParts = (message.content ?? [])
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text);
    pendingText = textParts.join("\n\n");
    pendingMessage = message as { content: unknown };
  }

  /**
   * Installs (or reinstalls) the streaming hook.
   */
  function installHook(): void {
    setAssistantMessageUpdateHook(onStreamUpdate);
  }

  /**
   * Called when a turn ends. Formats all assistant messages in the turn.
   */
  async function onTurnEnd(_event: unknown, ctx: Pick<ExtensionContext, "sessionManager" | "cwd">): Promise<void> {
    const branch = ctx.sessionManager.getBranch();
    const assistantMessages: Array<{ message: { content: unknown }; content: string }> = [];

    for (const entry of branch) {
      if (entry.type !== "message") continue;
      if (entry.message?.role !== "assistant") continue;
      const raw = typeof entry.message.content === "string"
        ? entry.message.content
        : (entry.message.content ?? [])
          .filter((part) => part.type === "text" && typeof part.text === "string")
          .map((part) => part.text)
          .join("\n\n");
      if (raw && !raw.startsWith("[END_MESSAGE_FORMATTER_RAN]")) {
        assistantMessages.push({ message: entry.message as { content: unknown }, content: raw });
      }
    }

    // Extract first user message once per turn.
    firstUserMessage = undefined;
    for (const entry of branch) {
      if (entry.type === "message" && entry.message?.role === "user") {
        const content = entry.message.content;
        if (typeof content === "string") {
          firstUserMessage = content;
          break;
        }
        if (Array.isArray(content)) {
          const text = content
            .filter((part) => part.type === "text" && typeof part.text === "string")
            .map((part) => part.text)
            .join("\n\n");
          if (text) { firstUserMessage = text; break; }
        }
      }
    }

    const userSection = firstUserMessage ? `User's first message:\n${firstUserMessage}\n\n` : "";

    for (const { message, content } of assistantMessages) {
      const combinedPrompt = `${formatterPrompt}\n\n---\n\n${userSection}${content}`;

      console.log("=== PROMPT SENT TO LLM ===");
      console.log(combinedPrompt);
      console.log("=== END PROMPT ===");

      const output = await runChild(ctx.cwd, combinedPrompt);
      const formatted = output || `Error: end-message formatter failed to produce output.\n\nOriginal message:\n${content}`;

      if (typeof message.content === "string") {
        message.content = formatted;
      } else {
        message.content = [{ type: "text", text: formatted }];
      }
    }

    // Reinstall hook to pick up the next turn's streaming updates.
    installHook();
  }

  // Install the streaming hook immediately.
  installHook();

  // Listen for turn_end to format completed messages.
  pi.on("turn_end", onTurnEnd);
}
