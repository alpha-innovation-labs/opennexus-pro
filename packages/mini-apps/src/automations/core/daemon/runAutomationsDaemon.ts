import { clearAutomationDaemonState } from "../state/clearAutomationDaemonState.js";
import { createAutomationDaemonState } from "../state/createAutomationDaemonState.js";
import { writeAutomationDaemonState } from "../state/writeAutomationDaemonState.js";
import { writeAutomationHeartbeat } from "../state/writeAutomationHeartbeat.js";
import { AUTOMATIONS_DAEMON_HEARTBEAT_INTERVAL_MS } from "../shared/constants.js";
import { ensureAutomationRootDir } from "../paths/ensureAutomationRootDir.js";
import { readSchedulerIntervalMs } from "./readSchedulerIntervalMs.js";
import { runAutomationSchedulerTick } from "./runAutomationSchedulerTick.js";
import { startBoundaryAlignedScheduler } from "./startBoundaryAlignedScheduler.js";

/**
 * Runs the long-lived automations scheduler daemon.
 */
export async function runAutomationsDaemon(): Promise<void> {
	ensureAutomationRootDir();
	writeAutomationDaemonState(createAutomationDaemonState(process.pid));
	writeAutomationHeartbeat();
	let stopping = false;
	const heartbeatTimer = setInterval(writeAutomationHeartbeat, AUTOMATIONS_DAEMON_HEARTBEAT_INTERVAL_MS);
	const scheduler = startBoundaryAlignedScheduler(runAutomationSchedulerTick, readSchedulerIntervalMs());
	/** Stops daemon timers, clears state, and exits cleanly. */
	const shutdown = () => {
		if (stopping) return;
		stopping = true;
		clearInterval(heartbeatTimer);
		scheduler.stop();
		clearAutomationDaemonState();
		process.exit(0);
	};
	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
	await new Promise(() => undefined);
}
