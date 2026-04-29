import assert from "node:assert/strict";
import test from "node:test";
import { withSilencedCursorModelDiscoveryWarnings } from "../../packages/extensions/src/ai-providers/register/withSilencedCursorModelDiscoveryWarnings.js";

/**
 * Captures console.warn output while running a callback.
 *
 * @param run Callback that may warn.
 * @returns Captured warning strings.
 */
async function captureWarnings(run: () => Promise<void>): Promise<string[]> {
	const originalWarn = console.warn;
	const warnings: string[] = [];
	console.warn = (...args: unknown[]) => warnings.push(args.map(String).join(" "));
	try {
		await run();
		return warnings;
	} finally {
		console.warn = originalWarn;
	}
}

test("withSilencedCursorModelDiscoveryWarnings hides empty Cursor discovery warnings", async () => {
	const warnings = await captureWarnings(async () => {
		await withSilencedCursorModelDiscoveryWarnings(async () => {
			console.warn("[cursor-provider] Model discovery returned no models");
		});
	});

	assert.deepEqual(warnings, []);
});

test("withSilencedCursorModelDiscoveryWarnings preserves unrelated warnings", async () => {
	const warnings = await captureWarnings(async () => {
		await withSilencedCursorModelDiscoveryWarnings(async () => {
			console.warn("different warning");
		});
	});

	assert.deepEqual(warnings, ["different warning"]);
});
