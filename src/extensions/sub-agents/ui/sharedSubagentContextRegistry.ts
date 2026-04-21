import { createObservationsContextProvider } from "../context-providers/createObservationsContextProvider.js";
import { createParentConversationProvider } from "../context-providers/createParentConversationProvider.js";
import { createSubagentContextRegistry } from "../context-providers/createSubagentContextRegistry.js";

/**
 * Shared registry of subagent context providers.
 */
export const sharedSubagentContextRegistry = createSubagentContextRegistry([
  createParentConversationProvider(),
  createObservationsContextProvider(),
]);
