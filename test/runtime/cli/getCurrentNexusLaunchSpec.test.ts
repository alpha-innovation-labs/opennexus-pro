import assert from "node:assert/strict";
import test from "node:test";
import { getSourceEntrypointPath } from "../../../packages/gateway-core/src/process/getSourceEntrypointPath.js";
import { getCurrentNexusLaunchSpec } from "../../../packages/nexus-runtime/src/cli/getCurrentNexusLaunchSpec.js";
import {
  isResumeLaunch,
  normalizeResumeStartupArgs,
  resumeLaunchEnvVar,
  shouldPrimeStartupResumeModal,
  startupResumeEnvVar,
} from "../../../packages/nexus-runtime/src/cli/normalizeResumeStartupArgs.js";

/**
 * Runs a test body with resume startup environment variables cleared.
 *
 * @param fn Test body.
 */
function withClearedResumeEnv(fn: () => void): void {
  const originalStartupResume = process.env[startupResumeEnvVar];
  const originalResumeLaunch = process.env[resumeLaunchEnvVar];
  delete process.env[startupResumeEnvVar];
  delete process.env[resumeLaunchEnvVar];

  try {
    fn();
  } finally {
    if (originalStartupResume === undefined) delete process.env[startupResumeEnvVar];
    else process.env[startupResumeEnvVar] = originalStartupResume;
    if (originalResumeLaunch === undefined) delete process.env[resumeLaunchEnvVar];
    else process.env[resumeLaunchEnvVar] = originalResumeLaunch;
  }
}

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
    const spec = getCurrentNexusLaunchSpec(["gateway", "__gateway-runner"]);

    assert.equal(spec.command, process.execPath);
    assert.deepEqual(spec.args, ["/opt/homebrew/bin/nexus", "gateway", "__gateway-runner"]);
  } finally {
    process.argv = originalArgv;
  }
});

test("normalizeResumeStartupArgs removes bare --resume so Nexus owns the resume picker", () => {
  withClearedResumeEnv(() => {
    assert.deepEqual(normalizeResumeStartupArgs(["--resume"]), []);
    assert.equal(shouldPrimeStartupResumeModal(), true);
    assert.equal(isResumeLaunch(), true);
  });
});

test("normalizeResumeStartupArgs rewrites targeted --resume launches into --session", () => {
  withClearedResumeEnv(() => {
    assert.deepEqual(normalizeResumeStartupArgs(["--resume", "018f3a77-8f7a-7d12-8f4f-8cb1c7d7a001", "--help"]), [
      "--session",
      "018f3a77-8f7a-7d12-8f4f-8cb1c7d7a001",
      "--help",
    ]);
    assert.equal(shouldPrimeStartupResumeModal(), false);
    assert.equal(isResumeLaunch(), true);
  });
});
