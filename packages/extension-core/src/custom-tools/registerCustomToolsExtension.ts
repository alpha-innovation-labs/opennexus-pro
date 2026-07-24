import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerAgentE2eTool } from "./agent-e2e/registerAgentE2eTool.js";

/**
 * Custom tools extension — the composition root.
 *
 * Registers every custom tool that this extension provides.
 *
 * @param pi Pi extension API.
 */
export default function registerCustomToolsExtension(pi: ExtensionAPI): void {
	registerAgentE2eTool(pi);
}
