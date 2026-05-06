import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { applyUserExtensionConfig } from "../../packages/feature-flags/src/applyUserExtensionConfig.js";
import { writeNexusUserConfig } from "../../packages/nexus-runtime/src/config/writeNexusUserConfig.js";
import type { FeatureFlagsConfig } from "../../packages/feature-flags/src/types.js";

/**
 * Runs a test with an isolated Nexus config directory.
 *
 * @param fn Test body.
 */
async function withConfigDir(fn: () => Promise<void> | void): Promise<void> {
	const dir = await mkdtemp(join(tmpdir(), "nexus-user-config-"));
	const previousConfigDir = process.env.NEXUS_CONFIG_DIR;
	process.env.NEXUS_CONFIG_DIR = dir;
	try {
		await fn();
	} finally {
		if (previousConfigDir === undefined) delete process.env.NEXUS_CONFIG_DIR;
		else process.env.NEXUS_CONFIG_DIR = previousConfigDir;
		await rm(dir, { recursive: true, force: true });
	}
}

test("applyUserExtensionConfig applies preferences to extension and other feature buckets", async () => {
	await withConfigDir(() => {
		writeNexusUserConfig({ extensions: { memory: { enabled: false }, "social-chat": { enabled: false } } });
		const config: FeatureFlagsConfig = {
			extensions: {
				memory: { category: "mini-app", enabled: true, features: ["memory"] },
			},
			other: {
				"social-chat": { category: "mini-app", enabled: true, features: ["social chat"] },
			},
		};

		const updated = applyUserExtensionConfig(config);

		assert.equal(updated.extensions.memory?.enabled, false);
		assert.equal(updated.other?.["social-chat"]?.enabled, false);
	});
});
