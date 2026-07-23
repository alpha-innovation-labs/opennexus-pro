import { existsSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getAgentDir } from "@earendil-works/pi-coding-agent";
import { normalizePromptlineTitleContent } from "./normalizePromptlineTitleContent.js";

/**
 * Reads the status title: observations topic title (if available),
 * then session name, then latest user prompt.
 *
 * @param getSessionName Pi session name getter.
 * @param ctx Extension context with session branch access.
 * @returns Trimmed display title, or undefined when no title source exists.
 */
export function getPromptlineStatusTitle(
	getSessionName: ExtensionAPI["getSessionName"],
	ctx: Pick<ExtensionContext, "sessionManager">,
): string | undefined {
	// 1. Try observations: read the last topic title from the state file
	const observationsTitle = readLatestObservationTitle(ctx);
	if (observationsTitle) return observationsTitle;

	// 2. Fall back to session name (set by the observations tracker)
	const sessionNameRaw = getSessionName();
	const sessionName = typeof sessionNameRaw === "string" ? sessionNameRaw.trim() : undefined;
	if (sessionName) return sessionName;

	// 3. Fall back to latest user prompt in the branch
	const branch = ctx.sessionManager.getBranch();
	for (let index = branch.length - 1; index >= 0; index -= 1) {
		const entry = branch[index] as { type?: string; message?: { role?: string; content?: unknown }; content?: unknown };
		if (entry.type === "message" && entry.message?.role === "user") return normalizePromptlineTitleContent(entry.message.content);
		if (entry.type === "custom_message") return normalizePromptlineTitleContent(entry.content);
	}

	return undefined;
}

/**
 * Reads the latest observation topic title from the state file.
 * Returns undefined when no state file exists or parsing fails.
 */
function readLatestObservationTitle(ctx: Pick<ExtensionContext, "sessionManager">): string | undefined {
	try {
		const sessionFile = ctx.sessionManager.getSessionFile();
		if (!sessionFile) return undefined;
		const baseName = basename(sessionFile).replace(/\.jsonl$/, "");
		const statePath = resolve(getAgentDir(), "observations", `${baseName}.json`);
		if (!existsSync(statePath)) return undefined;
		const content = readFileSync(statePath, "utf8");
		const parsed = JSON.parse(content) as { topics?: Array<{ title?: string }> };
		const topics = Array.isArray(parsed.topics) ? parsed.topics : [];
		const lastTopic = topics.at(-1);
		return lastTopic?.title?.trim();
	} catch {
		return undefined;
	}
}
