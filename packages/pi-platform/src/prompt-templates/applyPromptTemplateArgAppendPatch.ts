/**
 * Parses a raw argument string into an array of tokens, respecting single
 * and double quotes. Copies the upstream implementation from
 * @earendil-works/pi-coding-agent/dist/core/prompt-templates.js (not exported
 * from the package's public API).
 */
/**
 * Parses a raw argument string into an array of tokens, respecting single
 * and double quotes. Copies the upstream implementation from
 * @earendil-works/pi-coding-agent/dist/core/prompt-templates.js (not exported
 * from the package's public API).
 *
 * Exported for use by SlashMenuModal.ts.
 */
export function parseCommandArgs(argsString: string): string[] {
	const args: string[] = [];
	let current = "";
	let inQuote: string | null = null;
	for (let i = 0; i < argsString.length; i++) {
		const char = argsString[i];
		if (inQuote) {
			if (char === inQuote) {
				inQuote = null;
			} else {
				current += char;
			}
		} else if (char === '"' || char === "'") {
			inQuote = char;
		} else if (/\s/.test(char)) {
			if (current) {
				args.push(current);
				current = "";
			}
		} else {
			current += char;
		}
	}
	if (current) {
		args.push(current);
	}
	return args;
}

/**
 * Substitutes argument placeholders in template content. Copies the upstream
 * implementation from @earendil-works/pi-coding-agent/dist/core/prompt-templates.js
 * (not exported from the package's public API).
 *
 * Supports: $1, $2, … for positional args; $@ and $ARGUMENTS for all args;
 * ${N:-default}, ${@:-default}, ${@:N}, ${@:N:L} for advanced bash-style slicing.
 */
/**
 * Substitutes argument placeholders in template content. Copies the upstream
 * implementation from @earendil-works/pi-coding-agent/dist/core/prompt-templates.js
 * (not exported from the package's public API).
 *
 * Supports: $1, $2, … for positional args; $@ and $ARGUMENTS for all args;
 * ${N:-default}, ${@:-default}, ${@:N}, ${@:N:L} for advanced bash-style slicing.
 *
 * Exported for use by SlashMenuModal.ts.
 */
export function substituteArgs(content: string, args: string[]): string {
	const allArgs = args.join(" ");
	return content.replace(
		/\$\{(\d+|ARGUMENTS|@):-([^}]*)\}|\$\{@:(\d+)(?::(\d+))?\}|\$(ARGUMENTS|@|\d+)/g,
		(_match, defaultTarget, defaultValue, sliceStart, sliceLength, simple) => {
			if (defaultTarget) {
				const value =
					defaultTarget === "@" || defaultTarget === "ARGUMENTS"
						? allArgs
						: args[parseInt(defaultTarget, 10) - 1];
				return value ? value : defaultValue;
			}
			if (sliceStart) {
				let start = parseInt(sliceStart, 10) - 1;
				if (start < 0) start = 0;
				if (sliceLength) {
					const length = parseInt(sliceLength, 10);
					return args.slice(start, start + length).join(" ");
				}
				return args.slice(start).join(" ");
			}
			if (simple === "ARGUMENTS" || simple === "@") {
				return allArgs;
			}
			const index = parseInt(simple, 10) - 1;
			return args[index] ?? "";
		},
	);
}

let __nexusPromptTemplatePatched__ = false;

/**
 * Unique sentinel used to mark where user args were appended.
 * Embedded in the expanded text so the double-append guard can detect it
 * regardless of where `$ARGUMENTS` appears in the template.
 */
export const SENTINEL = "__NEXUS_ARG_SENTINEL__";

/**
 * Whitelist of user-facing slash command names that may have args appended.
 * Internal routing commands (e.g. /nexus-model-select) are excluded.
 */
const KNOWN_USER_COMMANDS = new Set([
	"deep-research",
	"git-commit",
	"git-push",
	"summarize",
	"rewrite",
	"translate",
	"explain",
	"refactor",
	"test",
	"docs",
	"fix",
	"review",
	"code-review",
	"changelog",
	"commit",
	"deploy",
	"status",
	"help",
	"prompt",
	"skill",
]);

/**
 * Checks whether template content explicitly requests user args.
 *
 * Uses a word-boundary regex so `$ARGUMENTS2` or `$ARGUMENTS_EXTRA`
 * do not trigger false positives.
 *
 * @param content Template body to inspect.
 * @returns True when `$ARGUMENTS` or `$@` appears as a standalone token.
 */
export function templateRequestsArgs(content: string): boolean {
	return /\$ARGUMENTS\b|\$@(?!\w)/.test(content);
}

/**
 * Checks whether the expanded text already ends with the sentinel marker,
 * indicating the modal path (or a previous invocation) already appended args.
 *
 * Uses `endsWith` rather than `includes` so that user args containing
 * the sentinel text do not cause a false positive (the sentinel must
 * appear at the very end of the string, i.e., appended by the modal path).
 *
 * NOTE: This function is exported for testing / external verification only.
 * The CLI path uses `text.endsWith(SENTINEL)` inline to decide whether to
 * skip re-appending.
 *
 * @param expanded Expanded template text.
 * @returns True when the sentinel is at the end.
 */
export function alreadyAppendedWithSentinel(expanded: string): boolean {
	return expanded.endsWith(SENTINEL);
}

/**
 * Applies the Nexus patch to `AgentSession.prototype.prompt`.
 * Wraps the original `prompt()` to expand prompt templates with appended args
 * only when the template explicitly requests them.
 */
export async function applyPromptTemplateArgAppendPatch(): Promise<void> {
	if (__nexusPromptTemplatePatched__) return;

	const { AgentSession: AgentSessionClass } = await import(
		"@earendil-works/pi-coding-agent"
	);
	const AgentSession = AgentSessionClass as {
		prototype: { prompt: (...args: unknown[]) => unknown };
	};

	// Keep the method unbound: each call must use the live session, not the
	// prototype (which has no extension runner or other session state).
	const originalPrompt = AgentSession.prototype.prompt;

	AgentSession.prototype.prompt = async function (
		this: { promptTemplates?: Array<{ name: string; content: string }> },
		...args: unknown[]
	): Promise<unknown> {
		let text = args[0] as string;
		const options = args[1] as Record<string, unknown> | undefined;
		const expandPromptTemplates =
			(options?.expandPromptTemplates as boolean) ?? true;

		// Only patch when prompt template expansion is enabled and text starts with "/"
		if (
			expandPromptTemplates &&
			typeof text === "string" &&
			text.startsWith("/")
		) {
			const match = text.match(/^\/([^\s]+)(?:\s+([\s\S]*))?$/);
			if (match) {
				const templateName = match[1];
				const argsString = match[2] ?? "";

				// Scope: only fire for known user commands, not internal routing.
				if (!KNOWN_USER_COMMANDS.has(templateName)) {
					return (originalPrompt as (...args: unknown[]) => unknown).call(
						this,
						text,
						options,
					);
				}

				const templates =
					(this.promptTemplates as Array<{ name: string; content: string }>) ??
					[];
				const template = templates.find((t) => t.name === templateName);

				if (template) {
					const templateArgs = parseCommandArgs(argsString);
					const expanded = substituteArgs(template.content, templateArgs);

					// Always append raw user args so the query is never silently lost,
					// regardless of whether the template references `$ARGUMENTS` / `$@`.
					if (argsString.trim().length > 0) {
						// Double-append guard: check if the input text already ends with
						// the sentinel, meaning the modal path (or a previous invocation)
						// already appended args. Skip re-appending in that case.
						if (text.endsWith(SENTINEL)) {
							// Modal path already appended args — strip the sentinel and
							// pass through (the sentinel is only for the guard, never
							// visible to the AI model or the user).
							text = text.slice(0, -SENTINEL.length);
							return (originalPrompt as (...args: unknown[]) => unknown).call(
								this,
								text,
								options,
							);
						}
						// Use parsed args (quotes stripped) instead of raw `argsString`
						// for consistent output between modal and CLI paths.
						const MAX_ARGS_LENGTH = 1_000_000; // 1MB
						const truncatedArgs = templateArgs.join(" ");
						const safeArgs =
							truncatedArgs.length > MAX_ARGS_LENGTH
								? `${truncatedArgs.slice(0, MAX_ARGS_LENGTH)}...[truncated]`
								: truncatedArgs;
						// The sentinel is NOT appended here — it would leak to the AI
						// model. The guard works because the modal path appends the
						// sentinel to the text, and the CLI path checks for it.
						text = `${expanded}\n\n${safeArgs}`;
					} else {
						text = expanded;
					}
				}
			}
		}

		return (originalPrompt as (...args: unknown[]) => unknown).call(
			this,
			text,
			options,
		);
	};

	__nexusPromptTemplatePatched__ = true;
}
