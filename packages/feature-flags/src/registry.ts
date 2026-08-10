import type { FeatureProductCategory } from "./types";

/**
 * Canonical registry of all bundled extensions and mini-apps.
 *
 * This is the single source of truth for extension inventory. Every extension
 * and mini-app that ships with Nexus must have an entry here. All entries
 * default to `enabled: true`. Users can disable extensions via their
 * `~/.config/nexus/config.json` under `featureFlags.<extensionId> = false`.
 *
 * The `features` and `category` fields are read-only — users cannot add or
 * modify them through config.
 */
export const bundledFeatureFlags: Readonly<Record<
	string,
	{
		enabled: true;
		features: string[];
		category?: FeatureProductCategory;
	}
>> = {
	"ai-providers": {
		enabled: true,
		features: ["ai-provider-management"],
		category: "core",
	},
	"auto-update": {
		enabled: true,
		features: ["auto-update-check"],
		category: "core",
	},
	cmux: {
		enabled: true,
		features: ["cmux-command"],
		category: "core",
	},
	"context-usage": {
		enabled: true,
		features: ["context-usage-tracking"],
		category: "core",
	},
	"exit-message": {
		enabled: true,
		features: ["exit-message-display"],
		category: "core",
	},
	"pi-packages": {
		enabled: true,
		features: ["pi-package-management"],
		category: "core",
	},
	"feature-management": {
		enabled: true,
		features: ["feature-flag-visualization"],
		category: "dev",
	},
	fff: {
		enabled: true,
		features: ["feature-flag-flags"],
		category: "dev",
	},
	rtk: {
		enabled: true,
		features: ["rtk-command"],
		category: "pro",
	},
	"neo-editor": {
		enabled: true,
		features: ["neo-editor"],
		category: "core",
	},
	hotkeys: {
		enabled: true,
		features: ["hotkey-triggers"],
		category: "core",
	},
	"slash-menu": {
		enabled: true,
		features: ["slash-command-menu"],
		category: "core",
	},
	"mini-app-manager": {
		enabled: true,
		features: ["mini-app-management"],
		category: "core",
	},
	notify: {
		enabled: true,
		features: ["desktop-notifications"],
		category: "core",
	},
	observations: {
		enabled: true,
		features: ["session-observations"],
		category: "core",
	},
	"system-prompt": {
		enabled: true,
		features: ["system-prompt-management"],
		category: "core",
	},
	"startup-hero": {
		enabled: true,
		features: ["startup-hero-ui"],
		category: "core",
	},
	tetris: {
		enabled: true,
		features: ["tetris-mini-app"],
		category: "mini-app",
	},
	tron: {
		enabled: true,
		features: ["tron-terminal"],
		category: "core",
	},
	webtools: {
		enabled: true,
		features: ["web-search"],
		category: "core",
	},
	"local-image-reader": {
		enabled: true,
		features: ["local-image-reading"],
		category: "extension",
	},
	subagents: {
		enabled: true,
		features: ["subagent-start", "subagent-prompt", "subagent-read", "subagent-send", "subagent-send-keys"],
		category: "extension",
	},
	herdrAgentEndLog: {
		enabled: true,
		features: ["writes last assistant message content to ~/.local/share/nexus/agent/state.json per Herdr pane on agent_end"],
		category: "extension",
	},
};

/**
 * Returns all extension IDs registered in the hardcoded registry.
 *
 * @returns Array of all extension/mini-app IDs.
 */
export function getAllBundledExtensionIds(): string[] {
	return Object.keys(bundledFeatureFlags);
}

/**
 * Returns whether one extension is registered in the hardcoded registry.
 *
 * @param id Extension ID to check.
 * @returns True when the extension is registered.
 */
export function isBundledExtension(id: string): boolean {
	return id in bundledFeatureFlags;
}
