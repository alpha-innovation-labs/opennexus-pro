/**
 * Checks whether a tool name follows Pi MCP direct-tool naming.
 *
 * @param name Tool name.
 * @returns True when the tool is an MCP tool.
 */
export function isMcpToolName(name: string): boolean {
	return name.startsWith("mcp__");
}
