/**
 * Core CLI runner — executes `herdr` CLI commands and parses JSON output.
 *
 * This is the lowest-level primitive; every other module builds on it.
 */

import { spawnSync, spawn } from "node:child_process";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * Parsed result from a `herdr` CLI call.
 * Either a JSON object or a `{ _raw: string }` for non-JSON output.
 */
export type HerdrResult = Record<string, unknown> & { _raw?: string };

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Runs a herdr CLI command and returns parsed JSON, or throws on failure.
 *
 * @param args CLI arguments (e.g. `["workspace", "create", "--label", "foo"]`).
 * @param options Optional timeout override.
 * @returns Parsed JSON result (or `{ _raw }` for non-JSON output).
 */
export function runHerdr(
	args: string[],
	{ timeoutMs = 10_000 }: { timeoutMs?: number } = {},
): HerdrResult {
	const result = spawnSync("herdr", args, {
		encoding: "utf-8",
		timeout: timeoutMs,
	});

	if (result.error) {
		throw new Error(`herdr ${args.join(" ")}: ${result.error.message}`);
	}

	const stderr = result.stderr?.toString() ?? "";
	const stdout = result.stdout?.toString() ?? "";

	// CLI errors write JSON to stderr; success writes JSON to stdout.
	const source = stderr.startsWith("{") ? stderr : stdout;

	if (!source) {
		throw new Error(`herdr ${args.join(" ")}: no output`);
	}

	// Some commands (e.g. `agent read`) output terminal content, not JSON.
	// If it doesn't start with "{", return the raw text.
	if (!source.startsWith("{")) {
		return { _raw: source } as HerdrResult;
	}

	try {
		return JSON.parse(source) as HerdrResult;
	} catch {
		throw new Error(
			`herdr ${args.join(" ")}: invalid JSON — ${source.slice(0, 200)}`,
		);
	}
}

/**
 * Async, non-blocking variant of `runHerdr` that returns a promise
 * resolving with the parsed result (or rejecting on error).
 *
 * @param args CLI arguments.
 * @param options Optional timeout override.
 * @returns Parsed JSON result (or `{ _raw }` for non-JSON output).
 */
export async function runHerdrAsync(
	args: string[],
	{ timeoutMs = 10_000 }: { timeoutMs?: number } = {},
): Promise<HerdrResult> {
	return new Promise<HerdrResult>((resolve, reject) => {
		const child = spawn("herdr", args, {
			env: { ...process.env, LC_ALL: "C", LANG: "C" },
		});

		const stderrChunks: Array<Buffer> = [];
		const stdoutChunks: Array<Buffer> = [];
		let timedOut = false;

		const timer = setTimeout(() => {
			timedOut = true;
			child.kill();
			reject(new Error(`herdr ${args.join(" ")}: timed out after ${timeoutMs}ms`));
		}, timeoutMs);

		child.stderr?.on("data", (chunk: Buffer) => stderrChunks.push(chunk));
		child.stdout?.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));

		child.on("error", (err: Error) => {
			clearTimeout(timer);
			if (!timedOut) {
				reject(new Error(`herdr ${args.join(" ")}: ${err.message}`));
			}
		});

		child.on("close", (code) => {
			clearTimeout(timer);
			if (timedOut) return;

			if (code !== 0 && code !== null) {
				reject(new Error(`herdr ${args.join(" ")} exited with code ${code}`));
				return;
			}

			const stderr = Buffer.concat(stderrChunks).toString();
			const stdout = Buffer.concat(stdoutChunks).toString();

			// CLI errors write JSON to stderr; success writes JSON to stdout.
			const source = stderr.startsWith("{") ? stderr : stdout;

			if (!source) {
				reject(new Error(`herdr ${args.join(" ")}: no output`));
				return;
			}

			if (!source.startsWith("{")) {
				resolve({ _raw: source } as HerdrResult);
				return;
			}

			try {
				resolve(JSON.parse(source) as HerdrResult);
			} catch {
				reject(
					new Error(
						`herdr ${args.join(" ")}: invalid JSON — ${source.slice(0, 200)}`,
					),
				);
			}
		});
	});
}
