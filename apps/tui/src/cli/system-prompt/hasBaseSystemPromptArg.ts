import { baseSystemPrompt } from "@nexus/runtime";

/**
 * Checks whether the CLI arguments already include the bundled base system prompt append.
 *
 * @param args Raw Pi CLI arguments.
 * @returns True when the bundled append argument is already present.
 */
export function hasBaseSystemPromptArg(args: string[]): boolean {
	for (let index = 0; index < args.length; index += 1) {
		if (
			args[index] === "--append-system-prompt" &&
			args[index + 1] === baseSystemPrompt
		) {
			return true;
		}
	}

	return false;
}
