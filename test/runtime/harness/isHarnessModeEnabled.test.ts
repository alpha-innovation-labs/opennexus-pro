import assert from "node:assert/strict";
import test from "node:test";
import { isHarnessModeEnabled } from "../../../apps/tui/src/runtime/harness/isHarnessModeEnabled.js";

test("isHarnessModeEnabled only enables harness mode for explicit opt-in", () => {
  const originalValue = process.env.NEXUS_DEV_TEST_MODE;

  try {
    delete process.env.NEXUS_DEV_TEST_MODE;
    assert.equal(isHarnessModeEnabled(), false);

    process.env.NEXUS_DEV_TEST_MODE = "0";
    assert.equal(isHarnessModeEnabled(), false);

    process.env.NEXUS_DEV_TEST_MODE = "1";
    assert.equal(isHarnessModeEnabled(), true);
  } finally {
    if (originalValue === undefined) {
      delete process.env.NEXUS_DEV_TEST_MODE;
    } else {
      process.env.NEXUS_DEV_TEST_MODE = originalValue;
    }
  }
});
