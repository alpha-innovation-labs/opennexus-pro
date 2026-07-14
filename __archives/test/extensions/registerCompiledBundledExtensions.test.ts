import assert from "node:assert/strict";
import test from "node:test";
import registerCompiledBundledExtensions from "../../packages/extension-core/src/runtime/registerCompiledBundledExtensions.js";

test("compiled bundled extension registration is async for Pi to await", () => {
  assert.equal(registerCompiledBundledExtensions.constructor.name, "AsyncFunction");
});
