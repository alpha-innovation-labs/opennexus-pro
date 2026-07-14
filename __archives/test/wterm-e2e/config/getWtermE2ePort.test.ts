import assert from "node:assert/strict";
import test from "node:test";
import { getWtermE2ePort } from "../../../apps/wterm-e2e/src/config/getWtermE2ePort.js";

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

test("getWtermE2ePort returns the default port", async () => {
  await withEnv("WTERM_E2E_PORT", undefined, () => {
    assert.equal(getWtermE2ePort(), 4831);
  });
});

test("getWtermE2ePort rejects invalid values", async () => {
  await withEnv("WTERM_E2E_PORT", "abc", () => {
    assert.throws(() => getWtermE2ePort(), /Invalid WTERM_E2E_PORT/);
  });
});
