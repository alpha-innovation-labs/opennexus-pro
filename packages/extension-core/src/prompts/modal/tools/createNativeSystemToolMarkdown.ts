const toolParams: Record<string, readonly string[]> = {
	read: ["path: string", "offset?: number", "limit?: number"],
	bash: ["command: string", "timeout?: number"],
	edit: ["path: string", "edits: { oldText: string; newText: string }[]"],
	write: ["path: string", "content: string"],
	grep: ["pattern: string", "path?: string", "glob?: string", "ignoreCase?: boolean", "literal?: boolean", "context?: number", "limit?: number"],
	find: ["pattern: string", "path?: string", "limit?: number"],
	ls: ["path?: string", "limit?: number"],
};

const toolDescriptions: Record<string, string> = {
	read: "Read file contents, including supported image attachments.",
	bash: "Execute a bash command in the current working directory.",
	edit: "Edit one file with exact text replacements.",
	write: "Create or overwrite a file with full content.",
	grep: "Search file contents for matching lines.",
	find: "Find files by glob pattern.",
	ls: "List directory contents.",
};

/** Builds markdown detail for one native system tool, including accepted params. */
export function createNativeSystemToolMarkdown(toolName: string): string | undefined {
	const params = toolParams[toolName];
	if (params === undefined) return undefined;
	return [
		`# ${toolName}`,
		"",
		toolDescriptions[toolName] ?? "Native system tool.",
		"",
		"## Params",
		...params.map((param) => `- \`${param}\``),
	].join("\n");
}
