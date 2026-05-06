import assert from "node:assert/strict";
import test from "node:test";
import { findMiniAppCommand } from "../../packages/mini-apps/src/registry/findMiniAppCommand.js";
import { findMiniAppRunnerCommand } from "../../packages/mini-apps/src/registry/findMiniAppRunnerCommand.js";
import { getMiniAppManifests } from "../../packages/mini-apps/src/registry/getMiniAppManifests.js";

/**
 * Reads bundled mini-app manifest ids for deterministic assertions.
 *
 * @returns Ordered mini-app manifest ids.
 */
function readMiniAppIds(): string[] {
	return getMiniAppManifests().map((manifest) => manifest.id);
}

test("bundled mini-app registry exposes social chat, annotation, and wallet manifests", () => {
	assert.deepEqual(readMiniAppIds(), ["social-chat", "annotation", "wallet"]);
});

test("mini-app registry routes user commands and daemon runner commands", () => {
	const manifests = getMiniAppManifests();

	assert.equal(findMiniAppCommand(manifests, ["social-chat", "-h"])?.id, "social-chat");
	assert.equal(findMiniAppCommand(manifests, ["annotation", "-h"])?.id, "annotation");
	assert.equal(findMiniAppCommand(manifests, ["wallet", "1"])?.id, "wallet");
	assert.equal(findMiniAppRunnerCommand(manifests, ["social-chat", "__social-chat-runner"])?.id, "social-chat");
	assert.equal(findMiniAppRunnerCommand(manifests, ["annotations-daemon", "__annotations-daemon-runner"])?.id, "annotation");
});
