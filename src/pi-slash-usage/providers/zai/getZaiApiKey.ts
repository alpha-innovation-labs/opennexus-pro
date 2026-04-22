import { readPiAuth } from "../../shared/readPiAuth.js";

/**
 * Resolves the z.ai API key from env or Pi auth.
 *
 * @returns z.ai API key.
 */
export function getZaiApiKey(): string | undefined {
	if (process.env.ZAI_API_KEY) return process.env.ZAI_API_KEY;
	if (process.env.Z_AI_API_KEY) return process.env.Z_AI_API_KEY;
	const auth = readPiAuth();
	const zAi = auth?.["z-ai"] as Record<string, unknown> | undefined;
	const zai = auth?.zai as Record<string, unknown> | undefined;
	return typeof zAi?.access === "string" ? zAi.access : typeof zAi?.key === "string" ? zAi.key : typeof zai?.access === "string" ? zai.access : typeof zai?.key === "string" ? zai.key : undefined;
}
