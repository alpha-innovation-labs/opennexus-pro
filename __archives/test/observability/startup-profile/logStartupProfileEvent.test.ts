import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync } from "node:fs";
import test from "node:test";
import { clearStartupProfileLog } from "../../../packages/observability/src/startup-profile/clearStartupProfileLog.js";
import { logStartupProfileEvent } from "../../../packages/observability/src/startup-profile/logStartupProfileEvent.js";
import { startupProfileLogPath } from "../../../packages/observability/src/startup-profile/startupProfileLogPath.js";

function removeLogFile(): void {
	if (existsSync(startupProfileLogPath)) rmSync(startupProfileLogPath, { force: true });
}

test("logStartupProfileEvent writes only when profiling is enabled", () => {
	removeLogFile();
	delete process.env.NEXUS_STARTUP_PROFILE;
	logStartupProfileEvent("test", "disabled");
	assert.equal(existsSync(startupProfileLogPath), false);

	process.env.NEXUS_STARTUP_PROFILE = "1";
	clearStartupProfileLog();
	logStartupProfileEvent("test", "enabled", { value: 1 });
	const output = readFileSync(startupProfileLogPath, "utf8");
	assert.match(output, /"scope":"test"/);
	assert.match(output, /"event":"enabled"/);
	assert.match(output, /"value":1/);

	delete process.env.NEXUS_STARTUP_PROFILE;
	removeLogFile();
});
