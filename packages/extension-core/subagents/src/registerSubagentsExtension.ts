import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerSubagentPromptTool } from "./tools/registerSubagentPromptTool";
import { registerSubagentReadTool } from "./tools/registerSubagentReadTool";
import { registerSubagentSendKeysTool } from "./tools/registerSubagentSendKeysTool";
import { registerSubagentSendTool } from "./tools/registerSubagentSendTool";
import { registerSubagentStartTool } from "./tools/registerSubagentStartTool";

/**
 * Registers subagent tools that wrap `herdr agent` commands.
 *
 * Exposes: subagent_start, subagent_prompt, subagent_read,
 *          subagent_send, subagent_send_keys.
 *
 * @param pi Pi extension API.
 */
export function registerSubagentsExtension(pi: ExtensionAPI): void {
	registerSubagentStartTool(pi);
	registerSubagentPromptTool(pi);
	registerSubagentReadTool(pi);
	registerSubagentSendTool(pi);
	registerSubagentSendKeysTool(pi);
}
