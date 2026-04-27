/**
 * Returns the icon used for one built-in tool name.
 *
 * @param toolName Tool name.
 * @returns Display icon.
 */
export function toolIcon(toolName: string): string {
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
