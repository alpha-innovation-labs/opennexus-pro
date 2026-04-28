const openCodeProviderAliases = new Map<string, string>([
	["minimax-coding-plan", "minimax-code"],
	["minimax", "minimax-code"],
	["minimax-cn", "minimax-code-cn"],
]);

/**
 * Maps OpenCode auth provider ids to Nexus provider ids.
 *
 * @param sourceProviderId Provider id from OpenCode auth.json.
 * @param credentialType Credential type in the OpenCode auth entry.
 * @returns Nexus provider id for the imported credential.
 */
export function getOpenCodeProviderAlias(sourceProviderId: string, credentialType: string): string {
	if (sourceProviderId === "openai" && credentialType === "oauth") {
		return "openai-codex";
	}
	return openCodeProviderAliases.get(sourceProviderId) ?? sourceProviderId;
}
