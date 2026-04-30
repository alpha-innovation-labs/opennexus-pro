import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerMemoryCommand } from "./command/registerMemoryCommand.js";
import { buildMemorySystemPrompt } from "./prompt/buildMemorySystemPrompt.js";
import { registerAddTweetMemoryBatchTool } from "./tools/registerAddTweetMemoryBatchTool.js";
import { registerAddTweetMemoryTool } from "./tools/registerAddTweetMemoryTool.js";
import { registerFetchTweetMemoryTool } from "./tools/registerFetchTweetMemoryTool.js";
import { registerListMemoryProjectsTool } from "./tools/registerListMemoryProjectsTool.js";

/**
 * Registers the Nexus memory extension.
 *
 * @param pi Extension API.
 */
export function registerMemoryExtension(pi: ExtensionAPI): void {
	registerMemoryCommand(pi);
	registerFetchTweetMemoryTool(pi);
	registerListMemoryProjectsTool(pi);
	registerAddTweetMemoryTool(pi);
	registerAddTweetMemoryBatchTool(pi);
	pi.on("before_agent_start", async (event) => {
		const memoryPrompt = buildMemorySystemPrompt(event.prompt);
		if (!memoryPrompt) return;
		return { systemPrompt: `${event.systemPrompt}\n\n${memoryPrompt}` };
	});
}

export default registerMemoryExtension;
