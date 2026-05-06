import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { isAnnotationsDaemonStartupFeatureEnabled } from "../../apps/tui/src/runtime/annotations-daemon/isAnnotationsDaemonStartupFeatureEnabled.js";
import { shouldStartAnnotationsDaemon } from "../../apps/tui/src/runtime/annotations-daemon/shouldStartAnnotationsDaemon.js";


test("annotations daemon startup feature is disabled by bundled feature flags", () => {
	const previousConfigDir = process.env.NEXUS_CONFIG_DIR;
	const configDir = mkdtempSync(join(tmpdir(), "nexus-annotations-daemon-test-"));
	process.env.NEXUS_CONFIG_DIR = configDir;
	try {
		assert.equal(isAnnotationsDaemonStartupFeatureEnabled(), false);
	} finally {
		if (previousConfigDir === undefined) delete process.env.NEXUS_CONFIG_DIR;
		else process.env.NEXUS_CONFIG_DIR = previousConfigDir;
		rmSync(configDir, { recursive: true, force: true });
	}
});

test("annotations daemon does not start when feature flags disable annotation startup", () => {
	assert.equal(shouldStartAnnotationsDaemon([], false), false);
});

test("annotations daemon starts for interactive runs when annotation startup is enabled", () => {
	assert.equal(shouldStartAnnotationsDaemon([], true), true);
});

test("annotations daemon does not start for extensionless or print runs", () => {
	assert.equal(shouldStartAnnotationsDaemon(["--no-extensions"], true), false);
	assert.equal(shouldStartAnnotationsDaemon(["-ne"], true), false);
	assert.equal(shouldStartAnnotationsDaemon(["--print"], true), false);
});
