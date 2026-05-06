import { runAnnotationsDaemon } from "./core/runner/runAnnotationsDaemon.js";
import { ANNOTATIONS_DAEMON_RUNNER_COMMAND } from "./core/shared/constants.js";
import type { MiniAppManifest } from "../registry/MiniAppManifest.js";
import { runAnnotationCommand } from "./runAnnotationCommand.js";

/**
 * Annotation mini-app manifest consumed by Nexus CLI routing.
 */
export const annotationMiniAppManifest: MiniAppManifest = {
	id: "annotation",
	label: "Annotation",
	features: ["nexus annotation CLI commands", "annotation daemon lifecycle commands"],
	isCommand: (argv) => argv[0] === "annotation",
	isRunnerCommand: (argv) => argv[0] === "annotations-daemon" && argv[1] === ANNOTATIONS_DAEMON_RUNNER_COMMAND,
	runCommand: runAnnotationCommand,
	runRunner: runAnnotationsDaemon,
};
