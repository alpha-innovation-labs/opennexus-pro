import type {
	ExtensionAPI,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { registerCommands } from "./commands/registerCommands";
import { persistUserConfig, resolveConfig } from "./config/loader";
import type { LocalImageReaderConfig } from "./config/types";
import { registerLocalImageTool } from "./tool/registerTool";

/**
 * Extension factory — the composition root.
 * Resolves configuration and registers the tool and commands.
 */
export default function registerLocalImageReaderExtension(
	pi: ExtensionAPI,
): void {
	let cachedConfig: LocalImageReaderConfig | undefined;

	// Load (or re-load) config from the Nexus user config file.
	const getConfig = (_ctx: ExtensionContext): LocalImageReaderConfig => {
		if (cachedConfig === undefined) {
			cachedConfig = resolveConfig();
		}
		return cachedConfig;
	};

	registerLocalImageTool(pi, getConfig);
	registerCommands(pi, getConfig, persistUserConfig);

	// Invalidate cache when settings change (on session_start).
	pi.on("session_start", () => {
		try {
			// Force re-read by clearing cache.
			cachedConfig = undefined;
			cachedConfig = resolveConfig();
		} catch {
			// Config is missing or invalid — leave cachedConfig as undefined
			// so the next tool call will throw the proper "no config found" error.
		}
	});
}
