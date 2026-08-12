import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getNexusAgentDirPath } from "@nexus/runtime";

const STATE_FILE = path.join(getNexusAgentDirPath(), "last-msg.json");

/**
 * Reads the current pane ID from `herdr pane current --current`.
 * Returns undefined if the CLI is unavailable or not running inside Herdr.
 */
function getCurrentPaneId(): string | undefined {
	const result = spawnSync("herdr", ["pane", "current", "--current"], {
		encoding: "utf-8",
		timeout: 5000,
	});

	if (result.error || result.status !== 0) {
		return undefined;
	}

	try {
		const parsed = JSON.parse(result.stdout);
		return parsed?.result?.pane?.pane_id;
	} catch {
		return undefined;
	}
}

/**
 * Reads the current tab ID from the pane current response.
 * Returns undefined if the CLI is unavailable or not running inside Herdr.
 */
function getCurrentTabId(): string | undefined {
	const result = spawnSync("herdr", ["pane", "current", "--current"], {
		encoding: "utf-8",
		timeout: 5000,
	});

	if (result.error || result.status !== 0) {
		return undefined;
	}

	try {
		const parsed = JSON.parse(result.stdout);
		return parsed?.result?.pane?.tab_id;
	} catch {
		return undefined;
	}
}

/**
 * Reads the current tab label (title) from `herdr tab get <tab_id>`.
 * Returns undefined if the CLI is unavailable or the tab has no label.
 */
function getCurrentTabLabel(tabId: string): string | undefined {
	const result = spawnSync("herdr", ["tab", "get", tabId], {
		encoding: "utf-8",
		timeout: 5000,
	});

	if (result.error || result.status !== 0) {
		return undefined;
	}

	try {
		const parsed = JSON.parse(result.stdout);
		return parsed?.result?.tab?.label;
	} catch {
		return undefined;
	}
}

/**
 * Retrieves the current Nexus session title from the Pi API.
 * Returns undefined when no session name has been set.
 * Handles corrupted session names that are JSON arrays (e.g., '["topic1", "topic2"]')
 * by joining them into a single string.
 */
function getSessionTitle(pi: ExtensionAPI): string | undefined {
	const name = pi.getSessionName?.();
	if (typeof name !== "string") return undefined;
	const trimmed = name.trim();
	if (!trimmed) return undefined;
	// Handle corrupted session names that are JSON arrays: ["topic1", "topic2"]
	if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
		try {
			const arr = JSON.parse(trimmed);
			if (Array.isArray(arr)) {
				return arr
					.map((s: unknown) => (typeof s === "string" ? s.trim() : String(s)))
					.join(" — ");
			}
		} catch {
			// Not valid JSON — return as-is
		}
	}
	return trimmed;
}

/**
 * Renames the current Herdr tab to the given label.
 * Returns true on success, false on failure.
 */
function renameTab(tabId: string, label: string): boolean {
	const result = spawnSync("herdr", ["tab", "rename", tabId, label], {
		encoding: "utf-8",
		timeout: 5000,
	});

	return result.status === 0 && !result.error;
}

interface AgentMessage {
	role?: string;
	content?: string | Array<{ text?: string }>;
}

/**
 * Reads the last assistant message from agent_end event data.
 * Scans messages array for the last entry with role === "assistant".
 */
function lastAssistantMessage(messages: unknown[]): AgentMessage | undefined {
	const arr = Array.isArray(messages) ? messages : [];
	for (let i = arr.length - 1; i >= 0; i -= 1) {
		const msg = arr[i] as AgentMessage | undefined;
		if (msg?.role === "assistant") {
			return msg;
		}
	}
	return undefined;
}

/**
 * Extracts a human-readable string from an assistant message.
 * Prefers content (text or string array), falls back to JSON stringification.
 */
function extractAssistantContent(msg: AgentMessage | undefined): string | undefined {
	if (!msg) return undefined;

	const content = msg.content;
	if (typeof content === "string") {
		return content;
	}

	if (Array.isArray(content)) {
		const textParts = content
			.filter((part): part is { text: string } => typeof part?.text === "string")
			.map((part) => part.text);
		if (textParts.length > 0) {
			return textParts.join("\n");
		}
	}

	return undefined;
}

/**
 * Reads the state file, parses it, adds/updates the pane entry, and writes it back.
 * Creates parent directories if they don't exist.
 */
function writeState(paneId: string, assistantMsg: string): void {
	fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });

	let data: Record<string, string> = {};
	try {
		const raw = fs.readFileSync(STATE_FILE, "utf-8");
		data = JSON.parse(raw);
	} catch {
		// File doesn't exist or is invalid — start fresh
		data = {};
	}

	data[paneId] = assistantMsg;

	fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Registers the Herdr agent-end-log extension.
 *
 * When running inside a Herdr-managed pane (HERDR_ENV=1), this extension
 * listens for agent_end events, extracts the last assistant message content,
 * and writes it to a per-pane state file at the Nexus agent directory (`last-msg.json`).
 *
 * It also rewrites the Herdr tab title to match the current session title.
 *
 * @param pi Pi extension API.
 */
export function registerHerdrAgentEndLogExtension(pi: ExtensionAPI): void {
	// Only operate inside a Herdr-managed pane
	if (process.env.HERDR_ENV !== "1") {
		return;
	}

	pi.on("agent_end", (event: unknown) => {
		const paneId = getCurrentPaneId();
		if (!paneId) {
			return;
		}

		const assistantMsg = lastAssistantMessage((event as Record<string, unknown>)?.messages as unknown[]);
		const content = extractAssistantContent(assistantMsg);

		if (content) {
			writeState(paneId, content);
		}

		// --- Session title: read the current Nexus session title and update the Herdr tab ---
		const tabId = getCurrentTabId();
		const sessionTitle = getSessionTitle(pi);
		if (tabId && sessionTitle) {
			const currentLabel = getCurrentTabLabel(tabId);
			if (currentLabel !== sessionTitle) {
				const displayTitle =
					sessionTitle.length > 15
						? `${sessionTitle.slice(0, 12)}...`
						: sessionTitle;
				renameTab(tabId, displayTitle);
			}
		}
	});
}
