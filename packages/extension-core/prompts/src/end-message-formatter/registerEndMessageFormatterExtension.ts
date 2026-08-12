import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type {
	AssistantMessageComponent,
	ExtensionAPI,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { setAssistantMessageUpdateHook } from "@nexus/pi-platform";
import { runChild } from "@nexus/runtime";

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
export function registerEndMessageFormatterExtension(pi: ExtensionAPI): void {
	const formatterPrompt = readFileSync(END_MESSAGE_FORMATTER_PATH, "utf-8");
	let _pendingMessage: { content: unknown } | null = null;
	let _pendingText: string = "";
	let firstUserMessage: string | undefined;

	/**
	 * Extracts the full text content from an assistant message.
	 */
	function extractAssistantText(content: unknown): string {
		if (typeof content === "string") return content;
		if (Array.isArray(content)) {
			return content
				.filter(
					(part) => typeof part === "object" && part !== null && "type" in part,
				)
				.map((part) => {
					const typed = part as { type: string; text?: string };
					if (typed.type === "text" && typeof typed.text === "string")
						return typed.text;
					return "";
				})
				.join("\n\n");
		}
		return "";
	}

	/**
	 * Collects text chunks as they stream in.
	 */
	function onStreamUpdate(
		component: AssistantMessageComponent,
		_message: unknown,
	): void {
		const content = (component as { message?: { content?: unknown } }).message
			?.content;
		const textParts = Array.isArray(content)
			? content
					.filter(
						(part) =>
							typeof part === "object" &&
							part !== null &&
							"type" in part &&
							(part as { type: string }).type === "text" &&
							typeof (part as { text?: string }).text === "string",
					)
					.map((part) => (part as { text?: string }).text)
			: typeof content === "string"
				? [content]
				: [];
		_pendingText = textParts.join("\n\n");
		_pendingMessage = { content };
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
	async function onTurnEnd(
		_event: unknown,
		ctx: Pick<ExtensionContext, "sessionManager" | "cwd">,
	): Promise<void> {
		const branch = ctx.sessionManager.getBranch();
		const assistantMessages: Array<{
			message: { content: unknown };
			content: string;
		}> = [];

		for (const entry of branch) {
			if (entry.type !== "message") continue;
			if (entry.message?.role !== "assistant") continue;
			const raw = extractAssistantText(entry.message.content);
			if (raw && !raw.startsWith("[END_MESSAGE_FORMATTER_RAN]")) {
				assistantMessages.push({
					message: entry.message as { content: unknown },
					content: raw,
				});
			}
		}

		// Extract first user message once per turn.
		firstUserMessage = undefined;
		for (const entry of branch) {
			if (entry.type === "message" && entry.message?.role === "user") {
				const extracted = extractAssistantText(entry.message.content);
				if (extracted) {
					firstUserMessage = extracted;
					break;
				}
			}
		}

		const userSection = firstUserMessage
			? `User's first message:\n${firstUserMessage}\n\n`
			: "";

		for (const { message, content } of assistantMessages) {
			const combinedPrompt = `${formatterPrompt}\n\n---\n\n${userSection}${content}`;

			console.log("=== PROMPT SENT TO LLM ===");
			console.log(combinedPrompt);
			console.log("=== END PROMPT ===");

			const output = await runChild(ctx.cwd, combinedPrompt);
			const formatted =
				output ||
				`Error: end-message formatter failed to produce output.\n\nOriginal message:\n${content}`;

			const extracted = extractAssistantText(message.content);
			message.content =
				typeof extracted === "string"
					? formatted
					: [{ type: "text", text: formatted }];
		}

		// Reinstall hook to pick up the next turn's streaming updates.
		installHook();
	}

	// Install the streaming hook immediately.
	installHook();

	// Listen for turn_end to format completed messages.
	pi.on("turn_end", onTurnEnd);
}
