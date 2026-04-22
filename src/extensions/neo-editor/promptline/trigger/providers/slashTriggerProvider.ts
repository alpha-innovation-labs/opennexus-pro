import { getSlashTriggerModal } from "./getSlashTriggerModal.js";
import { refreshSlashTriggerProvider } from "./refreshSlashTriggerProvider.js";
import type { TriggerProvider } from "../types.js";

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
