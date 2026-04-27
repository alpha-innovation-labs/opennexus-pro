import type {
	createBashTool,
	createEditTool,
	createFindTool,
	createGrepTool,
	createLsTool,
	createReadTool,
	createWriteTool,
} from "@mariozechner/pi-coding-agent";

/**
 * Text-only tool-result content block.
 */
export type ToolResultBlock = { type: string; text?: string };

/**
 * Built-in tool map for compact nexus rendering.
 */
export type BuiltInTools = {
	read: ReturnType<typeof createReadTool>;
	bash: ReturnType<typeof createBashTool>;
	edit: ReturnType<typeof createEditTool>;
	write: ReturnType<typeof createWriteTool>;
	find: ReturnType<typeof createFindTool>;
	grep: ReturnType<typeof createGrepTool>;
	ls: ReturnType<typeof createLsTool>;
};
