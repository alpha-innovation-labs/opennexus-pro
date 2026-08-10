/**
 * Returns the display icon for one tool name.
 *
 * @param toolName Tool name.
 * @returns Icon glyph.
 */
export function iconForToolName(toolName: string): string {
	switch (toolName) {
		case "read":
			return "󰈙";
		case "bash":
			return "󰆍";
		case "edit":
			return "󰏫";
		case "write":
			return "󰆓";
		case "find":
			return "󰍉";
		case "grep":
			return "󰈞";
		case "ls":
			return "󰉋";
		default:
			return "󰘧";
	}
}
