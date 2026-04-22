import assert from "node:assert/strict";
import test from "node:test";
import { resolveBundledExtensionFactories } from "../../../src/runtime/extensions/resolveBundledExtensionFactories.js";

test("resolveBundledExtensionFactories returns factories by default", async () => {
  let called = false;

  const factories = await resolveBundledExtensionFactories(["--help"], async () => {
    called = true;
    return [() => {}];
  });

  assert.equal(called, true);
  assert.equal(factories.length, 1);
});

test("resolveBundledExtensionFactories disables factories for --no-extensions", async () => {
  let called = false;

  const factories = await resolveBundledExtensionFactories(["--no-extensions", "--help"], async () => {
    called = true;
    return [() => {}];
  });

  assert.equal(called, false);
  assert.deepEqual(factories, []);
});

test("resolveBundledExtensionFactories disables factories for -ne", async () => {
  let called = false;

  const factories = await resolveBundledExtensionFactories(["-ne", "--help"], async () => {
    called = true;
    return [() => {}];
  });

  assert.equal(called, false);
  assert.deepEqual(factories, []);
});
