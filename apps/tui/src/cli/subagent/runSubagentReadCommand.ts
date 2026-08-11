import { runHerdr } from "@nexus/herdr";

/**
 * Reads terminal output from an agent via `herdr agent read`.
 *
 * @param agentName The target agent name (e.g. "agent-abc1").
 * @param options Read options (lines, source).
 * @returns Process exit code.
 */
export async function runSubagentReadCommand(
	agentName: string,
	options: { lines?: string; source?: string } = {},
): Promise<number> {
	try {
		const args = ["agent", "read", agentName];
		if (options.lines) args.push("--lines", options.lines);
		if (options.source) args.push("--source", options.source);

		const result = runHerdr(args, { timeoutMs: 10_000 });

		// Output may be plain text (terminal content) or JSON (error).
		if (typeof result === "object" && result !== null && "_raw" in result) {
			console.log((result as Record<string, unknown>)._raw);
		} else {
			console.log(JSON.stringify(result));
		}

		return 0;
	} catch (err) {
		const message = (err as Error).message ?? `read failed: status=1`;
		console.error(message);
		return 1;
	}
}
