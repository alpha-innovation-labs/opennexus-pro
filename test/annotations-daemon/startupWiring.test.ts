import assert from "node:assert/strict";
import test from "node:test";
import { annotationMiniAppManifest } from "../../packages/mini-apps/src/annotation/manifest.js";
import { getAnnotationsDaemonLaunchSpec } from "../../packages/mini-apps/src/annotation/core/process/getAnnotationsDaemonLaunchSpec.js";


test("annotations daemon has a hidden Nexus runner command", () => {
  assert.equal(annotationMiniAppManifest.isRunnerCommand(["annotations-daemon", "__annotations-daemon-runner"]), true);
  assert.equal(annotationMiniAppManifest.isRunnerCommand(["annotations-daemon", "start"]), false);
});

test("annotations daemon launch spec relaunches the current Nexus entrypoint", () => {
  const spec = getAnnotationsDaemonLaunchSpec();
  assert.match(spec.args.join(" "), /annotations-daemon __annotations-daemon-runner/);
});
