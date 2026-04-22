import assert from "node:assert/strict";
import test from "node:test";
import { getCurrentNexusLaunchSpec } from "../../../src/runtime/cli/getCurrentNexusLaunchSpec.js";
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
