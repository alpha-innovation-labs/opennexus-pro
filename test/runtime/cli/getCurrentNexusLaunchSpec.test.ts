import assert from "node:assert/strict";
import test from "node:test";
import { getCurrentNexusLaunchSpec } from "../../../src/runtime/cli/getCurrentNexusLaunchSpec.js";
import { normalizeResumeStartupArgs, shouldPrimeStartupResumeModal, startupResumeEnvVar } from "../../../src/runtime/cli/normalizeResumeStartupArgs.js";
import { getSourceEntrypointPath } from "../../../src/gateway/process/getSourceEntrypointPath.js";

test("getCurrentNexusLaunchSpec launches the source entrypoint through tsx in source mode", () => {
  const originalArgv = process.argv;
  process.argv = ["/usr/local/bin/node", getSourceEntrypointPath(), "--version"];

  try {
    const spec = getCurrentNexusLaunchSpec(["--version"]);

    assert.match(spec.command, /tsx$/);
    assert.match(spec.args.join(" "), /src\/index\.ts --version/);
  } finally {
    process.argv = originalArgv;
  }
});

test("getCurrentNexusLaunchSpec falls back to the current cli entrypoint outside source mode", () => {
  const originalArgv = process.argv;

  process.argv = ["/usr/local/bin/node", "/opt/homebrew/bin/nexus", "--resume"];

  try {
    const spec = getCurrentNexusLaunchSpec(["adapter", "__gateway-runner"]);

    assert.equal(spec.command, process.execPath);
    assert.deepEqual(spec.args, ["/opt/homebrew/bin/nexus", "adapter", "__gateway-runner"]);
  } finally {
    process.argv = originalArgv;
  }
});

test("normalizeResumeStartupArgs strips bare --resume and primes the Nexus startup modal", () => {
  const original = process.env[startupResumeEnvVar];
  delete process.env[startupResumeEnvVar];

  try {
    assert.deepEqual(normalizeResumeStartupArgs(["--resume", "--help"]), ["--help"]);
    assert.equal(shouldPrimeStartupResumeModal(), true);
  } finally {
    if (original === undefined) delete process.env[startupResumeEnvVar];
    else process.env[startupResumeEnvVar] = original;
  }
});

test("normalizeResumeStartupArgs rewrites targeted --resume launches into --session", () => {
  const original = process.env[startupResumeEnvVar];
  delete process.env[startupResumeEnvVar];

  try {
    assert.deepEqual(normalizeResumeStartupArgs(["--resume", "018f3a77-8f7a-7d12-8f4f-8cb1c7d7a001", "--help"]), [
      "--session",
      "018f3a77-8f7a-7d12-8f4f-8cb1c7d7a001",
      "--help",
    ]);
    assert.equal(shouldPrimeStartupResumeModal(), false);
  } finally {
    if (original === undefined) delete process.env[startupResumeEnvVar];
    else process.env[startupResumeEnvVar] = original;
  }
});
