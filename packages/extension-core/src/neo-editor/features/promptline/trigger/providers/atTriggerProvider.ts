import { getAtTriggerModal } from "./getAtTriggerModal.js";
import { refreshAtTriggerProvider } from "./refreshAtTriggerProvider.js";
import type { TriggerProvider } from "../types.js";

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
