import { createPiToolDefinitions } from "./tools/createPiToolDefinitions";

export { createPiToolDefinitions };

/**
 * Exposes Pi's built-in tool definitions for Nexus render hooks.
 */
export const allToolDefinitions = createPiToolDefinitions(process.cwd());
