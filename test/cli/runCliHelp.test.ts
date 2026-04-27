import assert from "node:assert/strict";
import test from "node:test";
import { runCliWithApp } from "../../apps/tui/src/cli/runCliWithApp.js";

/**
 * Captures console.log output during a CLI test.
 *
 * @param fn Function that prints through console.log.
 * @returns Captured output lines.
 */
async function captureConsoleLog(fn: () => Promise<void>): Promise<string[]> {
	const originalConsoleLog = console.log;
	const output: string[] = [];
	console.log = (line?: unknown) => {
		output.push(String(line ?? ""));
	};
	try {
		await fn();
		return output;
	} finally {
		console.log = originalConsoleLog;
	}
}

test("runCliWithApp prints Nexus-owned top-level help for -h and skips Pi startup", async () => {
	let ranApp = false;
	let exitCode = -1;
	const output = await captureConsoleLog(async () => {
		exitCode = await runCliWithApp(["-h"], {
			async runApp() {
				ranApp = true;
			},
		});
	});
	const text = output.join("\n");

	assert.equal(exitCode, 0);
	assert.equal(ranApp, false);
	assert.match(text, /Usage: nexus \[options\] \[prompt\]/u);
	assert.match(text, /nexus gateway -h/u);
	assert.match(text, /--sessions/u);
	assert.match(text, /--session-dir <path>/u);
	assert.match(text, /--session-dir=<path>/u);
	assert.match(text, /--resume \[session-id\]/u);
	assert.match(text, /-r \[session-id\]/u);
	assert.match(text, /--resume=<session-id>/u);
	assert.match(text, /--session <session-id>/u);
	assert.match(text, /--startup-profile/u);
	assert.match(text, /--no-extensions/u);
	assert.match(text, /-ne/u);
	assert.match(text, /-p <prompt>/u);
	assert.match(text, /--model <model>/u);
	assert.match(text, /--mode <mode>/u);
	assert.match(text, /--theme <path>/u);
	assert.match(text, /--prompt-template <path>/u);
	assert.match(text, /nexus gateway start/u);
	assert.match(text, /nexus gateway stop/u);
	assert.match(text, /nexus gateway restart/u);
	assert.match(text, /nexus gateway status/u);
	assert.doesNotMatch(text, /nexus list/u);
});

test("runCliWithApp prints scoped gateway help for nexus gateway -h", async () => {
	let ranApp = false;
	let exitCode = -1;
	const output = await captureConsoleLog(async () => {
		exitCode = await runCliWithApp(["gateway", "-h"], {
			async runApp() {
				ranApp = true;
			},
		});
	});
	const text = output.join("\n");

	assert.equal(exitCode, 0);
	assert.equal(ranApp, false);
	assert.match(text, /Usage: nexus gateway <start\|stop\|restart\|status>/u);
	assert.match(text, /start/u);
	assert.match(text, /status/u);
	assert.doesNotMatch(text, /adapter/u);
});
