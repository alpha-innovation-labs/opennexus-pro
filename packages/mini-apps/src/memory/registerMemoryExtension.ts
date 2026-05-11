import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerMemoryCommand } from "./command/registerMemoryCommand.js";
import { buildMemorySystemPrompt } from "./prompt/buildMemorySystemPrompt.js";
import { registerAddTweetMemoryBatchTool } from "./tools/registerAddTweetMemoryBatchTool.js";
import { registerAddTweetMemoryTool } from "./tools/registerAddTweetMemoryTool.js";
import { registerFetchTweetMemoryTool } from "./tools/registerFetchTweetMemoryTool.js";
import { registerListMemoryProjectsTool } from "./tools/registerListMemoryProjectsTool.js";
import { registerQueryMemoryTool } from "./tools/registerQueryMemoryTool.js";
import { registerReadMemoryReferenceTool } from "./tools/registerReadMemoryReferenceTool.js";

/**
 * Registers the Nexus memory extension.
 *
 * @param pi Extension API.
 */
export function registerMemoryExtension(pi: ExtensionAPI): void {
	registerMemoryCommand(pi);
	registerFetchTweetMemoryTool(pi);
	registerListMemoryProjectsTool(pi);
	registerQueryMemoryTool(pi);
	registerReadMemoryReferenceTool(pi);
	registerAddTweetMemoryTool(pi);
	registerAddTweetMemoryBatchTool(pi);
	pi.on("before_agent_start", async (event) => {
		const memoryPrompt = buildMemorySystemPrompt(event.prompt);
		if (!memoryPrompt) return;
		return { systemPrompt: `${event.systemPrompt}\n\n${memoryPrompt}` };
	});
}

export default registerMemoryExtension;
