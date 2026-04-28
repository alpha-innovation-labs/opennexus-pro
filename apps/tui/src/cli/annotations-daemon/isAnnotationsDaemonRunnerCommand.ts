import { ANNOTATIONS_DAEMON_RUNNER_COMMAND } from "@nexus/annotations-daemon-core/shared/constants.js";

/**
 * Reports whether argv targets the internal annotations daemon runner.
 *
 * @param argv Raw CLI args.
 * @returns True when the hidden daemon runner is requested.
 */
export function isAnnotationsDaemonRunnerCommand(argv: readonly string[]): boolean {
  return argv[0] === "annotations-daemon" && argv[1] === ANNOTATIONS_DAEMON_RUNNER_COMMAND;
}
