import type { TriggerProvider } from "../types";
import { getSlashTriggerModal } from "./getSlashTriggerModal";
import { refreshSlashTriggerProvider } from "./refreshSlashTriggerProvider";

/**
 * Provider contract for the `/` trigger.
 */
export const slashTriggerProvider: TriggerProvider = {
	routeInput(data, routeTriggerInput) {
		return routeTriggerInput("slash", data);
	},
	getModal: getSlashTriggerModal,
	refresh: refreshSlashTriggerProvider,
};
