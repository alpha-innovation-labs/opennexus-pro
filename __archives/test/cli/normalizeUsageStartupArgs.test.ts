import assert from "node:assert/strict";
import test from "node:test";
import { normalizeUsageStartupArgs, shouldPrimeStartupUsageModal, startupUsageEnvVar } from "../../packages/nexus-runtime/src/cli/normalizeUsageStartupArgs.js";

test("normalizeUsageStartupArgs removes --usage and stores startup intent", () => {
  const previous = process.env[startupUsageEnvVar];
  try {
    delete process.env[startupUsageEnvVar];
    assert.deepEqual(normalizeUsageStartupArgs(["--usage", "--model", "x"]), ["--model", "x"]);
    assert.equal(shouldPrimeStartupUsageModal(), true);
  } finally {
    if (previous === undefined) delete process.env[startupUsageEnvVar];
    else process.env[startupUsageEnvVar] = previous;
  }
});

test("normalizeUsageStartupArgs leaves args unchanged when --usage is absent", () => {
  const previous = process.env[startupUsageEnvVar];
  try {
    delete process.env[startupUsageEnvVar];
    assert.deepEqual(normalizeUsageStartupArgs(["hello"]), ["hello"]);
    assert.equal(shouldPrimeStartupUsageModal(), false);
  } finally {
    if (previous === undefined) delete process.env[startupUsageEnvVar];
    else process.env[startupUsageEnvVar] = previous;
  }
});
