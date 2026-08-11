/**
 * KEYBINDINGS resolved at runtime.
 *
 * The pi-coding-agent package does not export KEYBINDINGS from its `exports` field.
 * This module builds the final bindings by merging TUI_KEYBINDINGS (publicly
 * exported from @earendil-works/pi-tui) with whatever the user has saved in
 * keybindings.json, and finally with Nexus-specific additions.
 *
 * If upstream ever publishes KEYBINDINGS as a public export, replace this file
 * with a simple re-export: `export { KEYBINDINGS } from "@earendil-works/pi-coding-agent";`
 */

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { TUI_KEYBINDINGS } from "@earendil-works/pi-tui";

/**
 * Resolves the agent directory where keybindings.json lives.
 * Mirrors the bootstrap logic from nexus-runtime's getNexusAgentDirPath().
 */
function resolveAgentDir(): string {
	const envDir = process.env.NEXUS_CODING_AGENT_DIR;
	if (envDir) return envDir;
	return join(homedir(), ".local", "share", "nexus", "agent");
}

const agentDir = resolveAgentDir();

/**
 * Loads user keybindings from keybindings.json if it exists.
 * Returns an empty object when the file is absent or invalid.
 */
function loadUserKeybindings(): Record<
	string,
	{ defaultKeys: string | string[] }
> {
	const configPath = join(agentDir, "keybindings.json");
	if (!existsSync(configPath)) return {};
	try {
		const parsed = JSON.parse(readFileSync(configPath, "utf-8"));
		if (typeof parsed !== "object" || parsed === null) return {};
		const result: Record<string, { defaultKeys: string | string[] }> = {};
		for (const [key, value] of Object.entries(parsed)) {
			if (typeof value === "string") {
				result[key] = { defaultKeys: value };
			} else if (
				Array.isArray(value) &&
				value.every((e: unknown) => typeof e === "string")
			) {
				result[key] = { defaultKeys: value as string[] };
			}
		}
		return result;
	} catch {
		return {};
	}
}

/**
 * Nexus-specific keybindings added on top of TUI + user config.
 */
const NEXUS_KEYBINDINGS: Record<
	string,
	{ defaultKeys: string | string[]; description: string }
> = {
	"app.tools.collapse": {
		defaultKeys: "shift+ctrl+c",
		description: "Collapse tool groups into summaries",
	},
};

/**
 * Final KEYBINDINGS: TUI defaults + user config overrides + minimal PI bindings + Nexus additions.
 */
export const KEYBINDINGS: Record<
	string,
	{ defaultKeys: string | string[]; description: string }
> = {
	...TUI_KEYBINDINGS,
	...loadUserKeybindings(),
	...NEXUS_KEYBINDINGS,
};

/**
 * Returns the user's custom keybindings as a flat map of key-id → defaultKeys.
 * Useful for patches that need to read user overrides.
 */
export function getUserKeybindings(): Record<
	string,
	{ defaultKeys: string | string[] }
> {
	return loadUserKeybindings();
}
