import assert from "node:assert/strict";
import test from "node:test";
import { calculateStartupLogoTopPadding } from "../../../packages/extensions/src/startup-logo/calculateStartupLogoTopPadding.js";

test("startup logo top padding centers the first editor prompt on normal terminals", () => {
	assert.equal(calculateStartupLogoTopPadding(40, 5), 12);
	assert.equal(calculateStartupLogoTopPadding(24, 5), 4);
});

test("startup logo top padding never goes negative on short terminals", () => {
	assert.equal(calculateStartupLogoTopPadding(10, 5), 0);
});
