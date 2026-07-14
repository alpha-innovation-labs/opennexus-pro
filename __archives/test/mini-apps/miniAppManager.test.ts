import assert from "node:assert/strict";
import test from "node:test";
import { registerMiniAppManagerExtension } from "../../packages/mini-apps/src/mini-app-manager/registerMiniAppManagerExtension.js";
import { createManagedMiniAppRows } from "../../packages/mini-apps/src/mini-app-manager/model/createManagedMiniAppRows.js";
import { setMiniAppEnabled } from "../../packages/mini-apps/src/mini-app-manager/model/setMiniAppEnabled.js";
import type { FeatureFlagsConfig } from "../../packages/feature-flags/src/types.js";

test("mini-app manager registers the mini-apps command", () => {
	const commands: string[] = [];

	registerMiniAppManagerExtension({
		registerCommand(name: string) {
			commands.push(name);
		},
	} as never);

	assert.deepEqual(commands, ["mini-apps"]);
});

test("mini-app manager rows include only mini-app feature flags", () => {
	const config: FeatureFlagsConfig = {
		extensions: {
			memory: { category: "mini-app", enabled: true, features: ["memory modal"] },
			notify: { category: "extension", enabled: true, features: ["notify"] },
		},
		other: {
			"social-chat": { category: "mini-app", enabled: false, features: ["social chat"] },
		},
	};

	assert.deepEqual(createManagedMiniAppRows(config).map((row) => row.id), ["memory", "social-chat"]);
});

test("mini-app manager updates mini-app flags in their source bucket", () => {
	const config: FeatureFlagsConfig = {
		extensions: {
			memory: { category: "mini-app", enabled: true, features: ["memory modal"] },
		},
		other: {
			"social-chat": { category: "mini-app", enabled: false, features: ["social chat"] },
		},
	};

	const withoutMemory = setMiniAppEnabled(config, "memory", false);
	const withSocialChat = setMiniAppEnabled(withoutMemory, "social-chat", true);

	assert.equal(withSocialChat.extensions.memory?.enabled, false);
	assert.equal(withSocialChat.other?.["social-chat"]?.enabled, true);
});
