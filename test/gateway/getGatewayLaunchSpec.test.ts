import assert from "node:assert/strict";
import test from "node:test";
import { getGatewayLaunchSpec } from "../../packages/gateway-core/src/process/getGatewayLaunchSpec.js";
import { getSourceEntrypointPath } from "../../packages/gateway-core/src/process/getSourceEntrypointPath.js";

test("getGatewayLaunchSpec launches the source entrypoint through tsx in source mode", () => {
  const originalArgv = process.argv;
  process.argv = ["/usr/local/bin/node", getSourceEntrypointPath(), "--resume"];

  try {
    const spec = getGatewayLaunchSpec();

    assert.match(spec.args.join(" "), /src\/index\.ts gateway __gateway-runner/);
    assert.match(spec.command, /tsx$/);
  } finally {
    process.argv = originalArgv;
  }
});

test("getGatewayLaunchSpec relaunches the current Nexus cli entrypoint outside source mode", () => {
  const originalArgv = process.argv;

  process.argv = ["/usr/local/bin/node", "/opt/homebrew/bin/nexus", "--resume"];

  try {
    const spec = getGatewayLaunchSpec();

    assert.equal(spec.command, process.execPath);
    assert.deepEqual(spec.args, ["/opt/homebrew/bin/nexus", "gateway", "__gateway-runner"]);
  } finally {
    process.argv = originalArgv;
  }
});
