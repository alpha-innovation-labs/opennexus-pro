import { readPiAuth } from "../../shared/readPiAuth.js";

/**
 * Resolves Antigravity auth details from env or Pi auth.
 *
 * @returns Antigravity auth payload.
 */
export function getAntigravityAuth(): { token?: string; projectId?: string } {
	const envToken = (process.env.GOOGLE_ANTIGRAVITY_OAUTH_TOKEN || process.env.ANTIGRAVITY_OAUTH_TOKEN || process.env.GOOGLE_ANTIGRAVITY_API_KEY || process.env.ANTIGRAVITY_API_KEY)?.trim();
	const envProjectId = (process.env.GOOGLE_ANTIGRAVITY_PROJECT_ID || process.env.GOOGLE_ANTIGRAVITY_PROJECT)?.trim();
	if (envToken) {
		try {
			const parsed = JSON.parse(envToken) as { token?: string; projectId?: string };
			if (parsed.token) return { token: parsed.token, projectId: parsed.projectId ?? envProjectId };
		} catch {
			return { token: envToken, projectId: envProjectId };
		}
	}
	const auth = readPiAuth();
	const entry = auth?.["google-antigravity"] as Record<string, unknown> | string | undefined;
	if (typeof entry === "string") return { token: entry };
	return {
		token: typeof entry?.access === "string" ? entry.access : typeof entry?.token === "string" ? entry.token : typeof entry?.key === "string" ? entry.key : undefined,
		projectId: typeof entry?.projectId === "string" ? entry.projectId : typeof entry?.project === "string" ? entry.project : undefined,
	};
}
