import { countActiveRuns } from "../storage/countActiveRuns.js";
import { countAutomations } from "../storage/countAutomations.js";
import { listLatestFailures } from "../storage/listLatestFailures.js";
import { listNextAutomations } from "../storage/listNextAutomations.js";
import { getAutomationDaemonStatus } from "../state/getAutomationDaemonStatus.js";
import type { AutomationDaemonStatus } from "../state/types.js";
import type { AutomationRecord, AutomationRunRecord } from "../storage/types.js";

/** Full status payload for the automations mini-app. */
export type AutomationsStatus = {
	daemon: AutomationDaemonStatus;
	automationCount: number;
	activeRunCount: number;
	nextAutomations: AutomationRecord[];
	latestFailures: AutomationRunRecord[];
};

/**
 * Reads daemon and automation summary status.
 *
 * @returns Automations status payload.
 */
export function getAutomationsStatus(): AutomationsStatus {
	return {
		daemon: getAutomationDaemonStatus(),
		automationCount: countAutomations(),
		activeRunCount: countActiveRuns(),
		nextAutomations: listNextAutomations(5),
		latestFailures: listLatestFailures(3),
	};
}
