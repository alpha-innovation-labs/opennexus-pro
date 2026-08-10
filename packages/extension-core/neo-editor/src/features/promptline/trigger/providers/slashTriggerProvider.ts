import { getSlashTriggerModal } from "./getSlashTriggerModal";
import { refreshSlashTriggerProvider } from "./refreshSlashTriggerProvider";
import type { TriggerProvider } from "../types";

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
