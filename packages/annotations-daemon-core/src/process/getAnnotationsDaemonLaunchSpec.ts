import { getCurrentNexusLaunchSpec } from "@nexus/runtime/cli/getCurrentNexusLaunchSpec.js";
import { ANNOTATIONS_DAEMON_RUNNER_COMMAND } from "../shared/constants.js";
import type { AnnotationsDaemonLaunchSpec } from "./types.js";

/**
 * Resolves how Nexus should relaunch itself as the annotations daemon.
 *
 * @returns Launch command and arguments.
 */
export function getAnnotationsDaemonLaunchSpec(): AnnotationsDaemonLaunchSpec {
  return getCurrentNexusLaunchSpec(["annotations-daemon", ANNOTATIONS_DAEMON_RUNNER_COMMAND]);
}
