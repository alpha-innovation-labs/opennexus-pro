import assert from "node:assert/strict";
import test from "node:test";
import { shouldShowStartupDurationBadge } from "../../../packages/extensions/src/startup-hero/shouldShowStartupDurationBadge.js";

test("startup duration badge is enabled for source dev runs", () => {
	assert.equal(shouldShowStartupDurationBadge(import.meta.url), true);
});
