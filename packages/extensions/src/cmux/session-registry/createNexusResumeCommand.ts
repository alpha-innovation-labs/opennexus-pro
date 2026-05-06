import { getCurrentNexusLaunchSpec } from "@nexus/runtime/cli/getCurrentNexusLaunchSpec.js";
import { shellQuote } from "./shellQuote.js";

export type NexusRestoreCommand = {
	command: string;
	args: string[];
	input: string;
};

/**
 * Creates the exact Nexus direct-resume command for a session.
 *
 * @param sessionId Nexus session id to resume.
 * @returns Structured command metadata and shell input.
 */
export function createNexusResumeCommand(sessionId: string): NexusRestoreCommand {
	const launchSpec = getCurrentNexusLaunchSpec(["--resume", sessionId]);
	const input = [...[launchSpec.command], ...launchSpec.args].map(shellQuote).join(" ");
	return { command: launchSpec.command, args: launchSpec.args, input };
}
