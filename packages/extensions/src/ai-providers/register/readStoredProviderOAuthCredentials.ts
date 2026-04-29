import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { OAuthCredentials } from "@mariozechner/pi-ai";
import { getAgentDir } from "@mariozechner/pi-coding-agent";

interface StoredOAuthCredential extends OAuthCredentials {
	type: "oauth";
}

/**
 * Reads stored OAuth credentials for a provider from Pi/Nexus auth.json.
 *
 * @param provider Provider id stored in auth.json.
 * @returns OAuth credentials when present, otherwise undefined.
 */
export async function readStoredProviderOAuthCredentials(provider: string): Promise<OAuthCredentials | undefined> {
	try {
		const authPath = join(getAgentDir(), "auth.json");
		const authText = await readFile(authPath, "utf8");
		const authData = JSON.parse(authText) as Record<string, StoredOAuthCredential | undefined>;
		const credential = authData[provider];
		if (credential?.type !== "oauth") return undefined;
		return credential;
	} catch {
		return undefined;
	}
}
