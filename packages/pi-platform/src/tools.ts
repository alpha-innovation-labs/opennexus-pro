import { createAllToolDefinitions } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/core/tools/index.js";

/**
 * Exposes Pi's built-in tool definitions for Nexus render hooks.
 */
export const allToolDefinitions = createAllToolDefinitions(process.cwd());
