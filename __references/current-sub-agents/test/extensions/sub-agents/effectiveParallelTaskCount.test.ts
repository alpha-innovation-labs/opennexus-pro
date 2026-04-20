import assert from "node:assert/strict";
import test from "node:test";
import { effectiveParallelTaskCount } from "../../../src/extensions/sub-agents/extension/tools/effectiveParallelTaskCount.js";

test("effectiveParallelTaskCount expands repeat counts", () => {
	assert.equal(effectiveParallelTaskCount([{ count: 3 }, {}, { count: 2 }]), 6);
	assert.equal(effectiveParallelTaskCount(undefined), 0);
	assert.equal(effectiveParallelTaskCount([{ count: 0 }, { count: -1 }, { count: 1.5 }]), 3);
});
