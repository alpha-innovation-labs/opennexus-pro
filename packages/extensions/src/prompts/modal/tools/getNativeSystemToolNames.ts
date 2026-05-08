const nativeSystemToolNames = ["read", "bash", "edit", "write", "grep", "find", "ls"] as const;

/** Returns Nexus/Pi native system tool names shown in /SystemPrompt. */
export function getNativeSystemToolNames(): readonly string[] {
	return nativeSystemToolNames;
}
