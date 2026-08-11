import { isResumeSelectorFlag } from "./isResumeSelectorFlag";
import { looksLikeSessionReference } from "./looksLikeSessionReference";

export interface ResumeCliRequest {
	mode: "none" | "picker" | "direct";
	flagIndex?: number;
	target?: string;
	consumesNextArg?: boolean;
}

/**
 * Parses CLI resume arguments to distinguish picker launches from direct session targets.
 *
 * @param argv Raw CLI arguments.
 * @returns Parsed resume request metadata.
 */
export function parseResumeCliRequest(
	argv: readonly string[],
): ResumeCliRequest {
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];

		if (isResumeSelectorFlag(arg)) {
			const next = argv[index + 1];
			if (
				typeof next === "string" &&
				!next.startsWith("-") &&
				looksLikeSessionReference(next)
			) {
				return {
					mode: "direct",
					flagIndex: index,
					target: next,
					consumesNextArg: true,
				};
			}

			return { mode: "picker", flagIndex: index };
		}

		if (arg.startsWith("--resume=")) {
			const target = arg.slice("--resume=".length);
			if (looksLikeSessionReference(target)) {
				return {
					mode: "direct",
					flagIndex: index,
					target,
					consumesNextArg: false,
				};
			}
		}
	}

	return { mode: "none" };
}
