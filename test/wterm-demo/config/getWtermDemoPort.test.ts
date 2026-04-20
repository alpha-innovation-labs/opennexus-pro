import assert from "node:assert/strict";
import test from "node:test";
import { getWtermDemoPort } from "../../../src/wterm-demo/config/getWtermDemoPort.js";

/**
 * Restores an environment variable after a test callback finishes.
 */
async function withEnv(
  name: string,
  value: string | undefined,
  callback: () => void | Promise<void>,
): Promise<void> {
  const previous = process.env[name];

  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }

  try {
    await callback();
  } finally {
    if (previous === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = previous;
    }
  }
}

test("getWtermDemoPort returns the default port", async () => {
  await withEnv("WTERM_DEMO_PORT", undefined, () => {
    assert.equal(getWtermDemoPort(), 4831);
  });
});

test("getWtermDemoPort rejects invalid values", async () => {
  await withEnv("WTERM_DEMO_PORT", "abc", () => {
    assert.throws(() => getWtermDemoPort(), /Invalid WTERM_DEMO_PORT/);
  });
});
