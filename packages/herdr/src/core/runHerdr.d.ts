/**
 * Core CLI runner — executes `herdr` CLI commands and parses JSON output.
 *
 * This is the lowest-level primitive; every other module builds on it.
 */
/**
 * Parsed result from a `herdr` CLI call.
 * Either a JSON object or a `{ _raw: string }` for non-JSON output.
 */
export type HerdrResult = Record<string, unknown> & {
    _raw?: string;
};
/**
 * Runs a herdr CLI command and returns parsed JSON, or throws on failure.
 *
 * @param args CLI arguments (e.g. `["workspace", "create", "--label", "foo"]`).
 * @param options Optional timeout override.
 * @returns Parsed JSON result (or `{ _raw }` for non-JSON output).
 */
export declare function runHerdr(args: string[], { timeoutMs }?: {
    timeoutMs?: number;
}): HerdrResult;
