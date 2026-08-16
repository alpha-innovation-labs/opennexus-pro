/**
 * Detects the binary used by `just dev` in the current project.
 *
 * Used during workspace setup to determine which agent kind to spawn.
 */

import { execSync } from "node:child_process";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolves what `just -n dev` actually runs, extracting the binary name.
 * Handles both plain recipes and shebang-body recipes (which print the
 * full script when queried with `-n`).
 *
 * @returns The detected binary name (e.g. "tsx", "bun", "node", "python").
 */
export function resolveJustDevBinary(): string {
	let output: string;
	try {
		// Use `npx just` because `tsx` may not resolve `just` from PATH.
		output = execSync("npx just -n dev", { encoding: "utf-8", timeout: 10000 });
	} catch {
		throw new Error("Could not run `npx just -n dev` — is just installed?");
	}

	// Shebang-body recipes print the entire script. Extract the final
	// executable line (the one that runs the actual binary).
	const lines = output.trim().split("\n");
	// Find the last non-empty, non-comment line that looks like a command.
	let commandLine = "";
	for (let i = lines.length - 1; i >= 0; i--) {
		const line = lines[i].trim();
		if (
			line &&
			!line.startsWith("#") &&
			!line.startsWith("set") &&
			line !== "set -a" &&
			line !== "set +a"
		) {
			commandLine = line;
			break;
		}
	}

	// Extract the actual binary from the command line.
	// Handles: `bun ...`, `tsx ...`, `npx --prefix pkg tsx ...`, `node ...`, `python ...`
	const bunMatch = commandLine.match(/\bbun\b/);
	const tsxMatch = commandLine.match(/\btsx\b/);
	const nodeMatch = commandLine.match(/\bnode\b/);
	const pythonMatch = commandLine.match(/\bpython\b/);

	if (bunMatch) return "bun";
	if (tsxMatch) return "tsx";

	if (nodeMatch) return "node";
	if (pythonMatch) return "python";

	// Fallback: search the full output for binary keywords
	if (/\bbun\b/.test(output)) return "bun";
	if (/\btsx\b/.test(output)) return "tsx";
	if (/\bnode\b/.test(output)) return "node";
	if (/\bpython\b/.test(output)) return "python";

	// If output is empty (tsx can't resolve `just` from PATH in npx),
	// default to tsx since this project's `just dev` always runs tsx.
	return "tsx";
}
