import { homedir } from "node:os";
import { join } from "node:path";
import { readJsonFile } from "../../shared/readJsonFile.js";
import { readNexusAuth } from "../../shared/readNexusAuth.js";

/**
 * Resolves the Gemini OAuth token from Pi auth or Gemini CLI storage.
 *
 * @returns Gemini OAuth token.
 */
export function getGeminiToken(): string | undefined {
	const auth = readNexusAuth();
	const entry = auth?.["google-gemini-cli"] as Record<string, unknown> | undefined;
	if (typeof entry?.access === "string" && entry.access.length > 0) return entry.access;
	const data = readJsonFile(join(homedir(), ".gemini", "oauth_creds.json"));
	if (typeof data?.access_token === "string" && data.access_token.length > 0) return data.access_token;
	return undefined;
}
