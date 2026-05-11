import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig.js";
import type { FeatureFlagsConfig } from "./types.js";

const LEGACY_EXTENSION_ALIASES: Record<string, string> = {
	prompts: "system-prompt",
	"which-key": "hotkeys",
};

/**
 * Applies user extension preferences from ~/.config/nexus/config.json.
 *
 * @param config Bundled feature flag config.
 * @returns Config with user extension enabled overrides applied.
 */
export function applyUserExtensionConfig(config: FeatureFlagsConfig): FeatureFlagsConfig {
	const userConfig = readNexusUserConfig();
	const extensions = { ...config.extensions };
	const other = { ...(config.other ?? {}) };

	for (const [rawId, preference] of Object.entries(userConfig.extensions ?? {})) {
		if (typeof preference.enabled !== "boolean") continue;
		const id = rawId in extensions ? rawId : LEGACY_EXTENSION_ALIASES[rawId] ?? rawId;
		const bundledExtension = extensions[id];
		if (bundledExtension) {
			extensions[id] = { ...bundledExtension, enabled: preference.enabled };
			continue;
		}
		const bundledOtherFeature = other[id];
		if (bundledOtherFeature) other[id] = { ...bundledOtherFeature, enabled: preference.enabled };
	}

	return { ...config, extensions, other };
}
