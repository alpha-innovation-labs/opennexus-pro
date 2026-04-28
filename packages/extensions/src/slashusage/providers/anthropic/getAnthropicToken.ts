import { execSync } from "node:child_process";
import { readNexusAuth } from "../../shared/readNexusAuth.js";

/**
 * Resolves the Claude OAuth token from Pi auth or macOS Keychain.
 *
 * @returns Claude OAuth token.
 */
export function getAnthropicToken(): string | undefined {
	const auth = readNexusAuth();
	const anthropic = auth?.anthropic as Record<string, unknown> | undefined;
	if (typeof anthropic?.access === "string" && anthropic.access.length > 0) return anthropic.access;
	try {
		const raw = execSync('security find-generic-password -s "Claude Code-credentials" -w 2>/dev/null', {
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
		const parsed = JSON.parse(raw) as { claudeAiOauth?: { accessToken?: string; scopes?: string[] } };
		if (parsed.claudeAiOauth?.scopes?.includes("user:profile") && parsed.claudeAiOauth.accessToken) return parsed.claudeAiOauth.accessToken;
	} catch {
		return undefined;
	}
	return undefined;
}
