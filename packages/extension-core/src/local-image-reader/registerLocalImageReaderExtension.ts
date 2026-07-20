import { existsSync, readFileSync } from "node:fs";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { resolveConfig, getGlobalSettingsPath } from "./config/loader.js";
import type { LocalImageReaderConfig } from "./config/types.js";
import { registerLocalImageTool } from "./tool/registerTool.js";
import { registerCommands } from "./commands/registerCommands.js";

/**
 * Extension factory — the composition root.
 * Resolves configuration and registers the tool and commands.
 */
export default function registerLocalImageReaderExtension(pi: ExtensionAPI): void {
  let cachedConfig: LocalImageReaderConfig | undefined;

  // Load (or re-load) config from settings.json.
  const getConfig = (ctx: ExtensionContext): LocalImageReaderConfig => {
    // Always resolve on first call.
    if (cachedConfig === undefined) {
      cachedConfig = resolveConfig(ctx.cwd);
    }
    return cachedConfig!;
  };

  registerLocalImageTool(pi, getConfig);
  registerCommands(pi, getConfig);

  // Invalidate cache when settings.json changes (on session_start).
  pi.on("session_start", () => {
    const settingsPath = getGlobalSettingsPath();
    try {
      // Force re-read by clearing cache.
      cachedConfig = undefined;
      // Validate that the settings file still exists and is parseable.
      if (existsSync(settingsPath)) {
        cachedConfig = resolveConfig("");
      }
    } catch {
      // Config is missing or invalid — leave cachedConfig as undefined
      // so the next tool call will throw the proper "no config found" error.
    }
  });
}
