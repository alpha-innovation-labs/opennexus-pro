import assert from "node:assert/strict";
import test from "node:test";
import { calculateStartupHeroTopPadding } from "../../../packages/extensions/src/startup-hero/calculateStartupHeroTopPadding.js";

test("startup hero top padding centers the first editor prompt on normal terminals", () => {
	assert.equal(calculateStartupHeroTopPadding(40, 5), 12);
	assert.equal(calculateStartupHeroTopPadding(24, 5), 4);
});

test("startup hero top padding never goes negative on short terminals", () => {
	assert.equal(calculateStartupHeroTopPadding(10, 5), 0);
});
