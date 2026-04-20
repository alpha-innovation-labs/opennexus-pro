import assert from "node:assert/strict";
import test from "node:test";
import { createSubAgentsExtensionFactory, registerSubAgentsExtension } from "../../../src/extensions/sub-agents/index.js";

test("createSubAgentsExtensionFactory returns the subagents register function", () => {
	const factory = createSubAgentsExtensionFactory();

	assert.equal(typeof factory, "function");
	assert.equal(factory, registerSubAgentsExtension);
});
