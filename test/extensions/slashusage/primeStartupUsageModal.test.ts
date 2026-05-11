import assert from "node:assert/strict";
import test from "node:test";
import { primeStartupUsageModal } from "../../../packages/extension-core/src/slashusage/primeStartupUsageModal.js";
import { startupUsageEnvVar } from "../../../packages/nexus-runtime/src/cli/normalizeUsageStartupArgs.js";

test("primeStartupUsageModal consumes --usage startup intent", async () => {
  const previous = process.env[startupUsageEnvVar];
  try {
    process.env[startupUsageEnvVar] = "1";
    await primeStartupUsageModal("startup", { hasUI: false } as never);
    assert.equal(process.env[startupUsageEnvVar], "1");
    await primeStartupUsageModal("startup", { hasUI: true, ui: { custom: () => Promise.resolve(), setWidget: () => undefined } } as never);
    assert.equal(process.env[startupUsageEnvVar], undefined);
  } finally {
    if (previous === undefined) delete process.env[startupUsageEnvVar];
    else process.env[startupUsageEnvVar] = previous;
  }
});
