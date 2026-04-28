import assert from "node:assert/strict";
import test from "node:test";
import { isAnnotationsDaemonRunnerCommand } from "../../apps/tui/src/cli/annotations-daemon/isAnnotationsDaemonRunnerCommand.js";
import { getAnnotationsDaemonLaunchSpec } from "../../packages/annotations-daemon-core/src/process/getAnnotationsDaemonLaunchSpec.js";


test("annotations daemon has a hidden Nexus runner command", () => {
  assert.equal(isAnnotationsDaemonRunnerCommand(["annotations-daemon", "__annotations-daemon-runner"]), true);
  assert.equal(isAnnotationsDaemonRunnerCommand(["annotations-daemon", "start"]), false);
});

test("annotations daemon launch spec relaunches the current Nexus entrypoint", () => {
  const spec = getAnnotationsDaemonLaunchSpec();
  assert.match(spec.args.join(" "), /annotations-daemon __annotations-daemon-runner/);
});
