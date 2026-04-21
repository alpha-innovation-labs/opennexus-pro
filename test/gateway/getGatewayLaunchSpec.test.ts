import assert from "node:assert/strict";
import test from "node:test";
import { getGatewayLaunchSpec } from "../../src/gateway/process/getGatewayLaunchSpec.js";

test("getGatewayLaunchSpec launches the source entrypoint through tsx in source mode", () => {
  const spec = getGatewayLaunchSpec();

  assert.match(spec.args.join(" "), /src\/index\.ts adapter __gateway-runner/);
  assert.match(spec.command, /tsx$/);
});
