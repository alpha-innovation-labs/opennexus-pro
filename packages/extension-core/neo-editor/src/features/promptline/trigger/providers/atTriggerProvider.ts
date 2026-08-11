import type { TriggerProvider } from "../types";
import { getAtTriggerModal } from "./getAtTriggerModal";
import { refreshAtTriggerProvider } from "./refreshAtTriggerProvider";

/**
 * Provider contract for the `@` trigger.
 */
export const atTriggerProvider: TriggerProvider = {
	routeInput(data, routeTriggerInput) {
		return routeTriggerInput("at", data);
	},
	getModal: getAtTriggerModal,
	refresh: refreshAtTriggerProvider,
};
