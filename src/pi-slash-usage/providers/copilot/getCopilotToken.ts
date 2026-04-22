import { homedir } from "node:os";
import { join } from "node:path";
import { readJsonFile } from "../../shared/readJsonFile.js";
import { readPiAuth } from "../../shared/readPiAuth.js";

/**
 * Resolves the GitHub token used for Copilot quota checks.
 *
 * @returns Copilot token.
 */
export function getCopilotToken(): string | undefined {
	const auth = readPiAuth();
	const entry = auth?.["github-copilot"] as Record<string, unknown> | undefined;
	if (typeof entry?.refresh === "string" && entry.refresh.length > 0) return entry.refresh;
	if (typeof entry?.access === "string" && entry.access.length > 0) return entry.access;
	for (const file of [join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "github-copilot", "hosts.json"), join(homedir(), ".github-copilot", "hosts.json")]) {
		const hosts = readJsonFile(file) as Record<string, Record<string, unknown>> | undefined;
		if (!hosts) continue;
		for (const host of ["github.com", "api.github.com", ...Object.keys(hosts)]) {
			const entry = hosts[host.toLowerCase()] ?? hosts[host];
			for (const key of ["oauth_token", "user_token", "github_token", "token"] as const) {
				if (typeof entry?.[key] === "string" && entry[key].length > 0) return entry[key] as string;
			}
		}
	}
	return undefined;
}
