import assert from "node:assert/strict";
import test from "node:test";
import { extractStartupProfileArgs } from "../../../apps/tui/src/runtime/startup-profile/extractStartupProfileArgs.js";

test("extractStartupProfileArgs strips the startup profiling flag", () => {
	const result = extractStartupProfileArgs(["--startup-profile", "-p", "hello"]);

	assert.deepEqual(result, {
		args: ["-p", "hello"],
		startupProfileEnabled: true,
	});
});

test("extractStartupProfileArgs leaves argv untouched when the flag is absent", () => {
	const result = extractStartupProfileArgs(["-p", "hello"]);

	assert.deepEqual(result, {
		args: ["-p", "hello"],
		startupProfileEnabled: false,
	});
});
