import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

type ToolDefinition = {
	name: string;
	execute?: (...args: unknown[]) => unknown;
};

let cachedTools: Map<string, ToolDefinition> | null = null;

/**
 * Loads the vendored websearch extension into a capture-only API and returns its tool map.
 *
 * @returns Registered vendored websearch tool definitions keyed by tool name.
 */
async function loadVendorWebsearchTools(): Promise<Map<string, ToolDefinition>> {
	if (cachedTools) return cachedTools;
	const tools = new Map<string, ToolDefinition>();
	const module = await import("../vendor/websearch/index.js");
	const captureApi = {
		registerTool(definition: ToolDefinition) {
			tools.set(definition.name, definition);
		},
		registerCommand() {},
		registerShortcut() {},
		on() {
			return () => undefined;
		},
		getModel() {
			return undefined;
		},
	} as unknown as ExtensionAPI;
	await module.default(captureApi);
	cachedTools = tools;
	return tools;
}

/**
 * Executes one lazily loaded vendored websearch tool by name.
 *
 * @param toolName Tool name to execute.
 * @param args Arguments passed by Pi to the tool handler.
 * @returns The vendored tool execution result.
 */
export async function executeLazyVendorWebsearchTool(toolName: string, args: unknown[]): Promise<unknown> {
	const tools = await loadVendorWebsearchTools();
	const tool = tools.get(toolName);
	if (typeof tool?.execute !== "function") {
		throw new Error(`Vendored websearch tool not found: ${toolName}`);
	}
	return tool.execute(...args);
}
