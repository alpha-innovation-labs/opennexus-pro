import assert from "node:assert/strict";
import test from "node:test";
import { compareVersions } from "../../packages/extensions/src/auto-update/model/compareVersions.js";
import { isNewerVersion } from "../../packages/extensions/src/auto-update/model/isNewerVersion.js";

test("auto-update compares semantic versions numerically", () => {
	assert.equal(compareVersions("0.2.10", "0.2.9"), 1);
	assert.equal(compareVersions("0.2.9", "0.2.10"), -1);
	assert.equal(compareVersions("1.0.0", "1.0.0"), 0);
});

test("auto-update detects newer npm versions", () => {
	assert.equal(isNewerVersion("0.2.20", "0.2.21"), true);
	assert.equal(isNewerVersion("0.2.20", "0.2.20"), false);
	assert.equal(isNewerVersion("0.2.20", "0.2.19"), false);
});
