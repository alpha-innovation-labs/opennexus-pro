import assert from "node:assert/strict";
import test from "node:test";
import { pickStartupHeroTip } from "../../../packages/extensions/src/startup-hero/pickStartupHeroTip.js";
import { startupHeroTips } from "../../../packages/extensions/src/startup-hero/startupHeroTips.js";

test("startup hero tip picker chooses one configured tip", () => {
	assert.equal(pickStartupHeroTip(() => 0), startupHeroTips[0]);
	assert.equal(pickStartupHeroTip(() => 0.999), startupHeroTips.at(-1));
});
