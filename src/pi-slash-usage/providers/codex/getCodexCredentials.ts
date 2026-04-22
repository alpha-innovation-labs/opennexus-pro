import { homedir } from "node:os";
import { join } from "node:path";
import { readJsonFile } from "../../shared/readJsonFile.js";
import { readPiAuth } from "../../shared/readPiAuth.js";

/**
 * Resolves Codex auth credentials from Pi or legacy Codex storage.
 *
 * @returns Codex token and optional account id.
 */
export function getCodexCredentials(): { token?: string; accountId?: string } {
	const auth = readPiAuth();
	const entry = auth?.["openai-codex"] as Record<string, unknown> | undefined;
	if (typeof entry?.access === "string" && entry.access.length > 0) {
		return { token: entry.access, accountId: typeof entry.accountId === "string" ? entry.accountId : undefined };
	}
	const data = readJsonFile(join(process.env.CODEX_HOME || join(homedir(), ".codex"), "auth.json"));
	if (typeof data?.OPENAI_API_KEY === "string" && data.OPENAI_API_KEY.length > 0) return { token: data.OPENAI_API_KEY };
	const tokens = data?.tokens as Record<string, unknown> | undefined;
	if (typeof tokens?.access_token === "string" && tokens.access_token.length > 0) {
		return { token: tokens.access_token, accountId: typeof tokens.account_id === "string" ? tokens.account_id : undefined };
	}
	return {};
}
