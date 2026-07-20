import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { LocalImageReaderConfig } from "../config/types.js";
import { getGlobalSettingsPath, readJsonFile, writeJsonFile } from "../config/loader.js";
import { fetchModels } from "../request/executor.js";

/**
 * Register the /local-image command with the Pi extension API.
 * This is the interactive settings manager — it does NOT perform image analysis.
 * The /local_image_reader tool handles all image analysis.
 *
 * @param pi - The Pi extension API.
 * @param getConfig - A function that resolves and caches configuration.
 */
export function registerCommands(
  pi: ExtensionAPI,
  getConfig: (ctx: ExtensionContext) => LocalImageReaderConfig,
): void {
  // Register /local-image command: interactive settings menu
  pi.registerCommand("local-image", {
    description:
      "Open an interactive settings menu to view and update the local-image-reader configuration.",
    handler: async (_args, ctx) => {
      const globalSettingsPath = getGlobalSettingsPath();

      // Always save to global settings.json.
      const fileData = readJsonFile(globalSettingsPath);
      const settings: Record<string, unknown> = fileData || {};

      // Load existing config or create fresh.
      const existing = (settings["local-image-reader"] as Record<string, unknown>) ?? {};
      const config: LocalImageReaderConfig = {
        url: (existing.url as string) ?? "",
        apiKey: (existing.apiKey as string) ?? "",
        model: (existing.model as string) ?? undefined,
        maxTokens: (existing.maxTokens as number) ?? undefined,
      };

      // Build options array for the TUI select menu.
      const buildOptions = (): string[] => {
        const options: string[] = [];
        const settingKeys: Array<keyof LocalImageReaderConfig> = ["url", "apiKey", "model"];
        for (const key of settingKeys) {
          const value = String(config![key] ?? "(not set)");
          options.push(`${key}: ${value}`);
        }
        if (config!.maxTokens) {
          options.push(`maxTokens: ${config!.maxTokens}`);
        }
        options.push("─────────────────");
        options.push("Cancel");
        return options;
      };

      // Helper to persist the current config to global settings.json.
      const persist = (): void => {
        settings["local-image-reader"] = {
          url: config!.url,
          apiKey: config!.apiKey,
          ...(config!.model ? { model: config!.model } : {}),
          ...(config!.maxTokens ? { maxTokens: config!.maxTokens } : {}),
        };
        writeJsonFile(globalSettingsPath, settings);
        ctx.ui.notify(`Saved local-image-reader settings to ${globalSettingsPath}`, "info");
      };

      // Show the menu and loop until Cancel.
      let choice: string | undefined;
      do {
        choice = await ctx.ui.select("local-image-reader Settings (global)", buildOptions());

        if (!choice || choice === "Cancel") {
          return;
        }

        // User selected a setting to edit — parse key and value.
        const colonIndex = choice.indexOf(": ");
        const settingKey = choice.slice(0, colonIndex) as keyof LocalImageReaderConfig;
        const currentValue = String(config![settingKey] ?? "");

        // Special handling for model: fetch and present available models.
        if (settingKey === "model") {
          if (!config.url || !config.apiKey) {
            ctx.ui.notify(
              "Cannot fetch models: URL and API key must be configured first.",
              "error",
            );
            continue;
          }

          ctx.ui.notify("Fetching available models from API…", "info");
          const modelResult = await fetchModels(config.url, config.apiKey, ctx.signal);

          if (modelResult.error) {
            ctx.ui.notify(modelResult.error, "error");
            continue;
          }

          if (modelResult.models.length === 0) {
            ctx.ui.notify(
              "No models returned. Falling back to manual input.",
              "warning",
            );
            const manualInput = await ctx.ui.input(settingKey, currentValue);
            if (manualInput !== undefined) {
              config.model = manualInput.trim() || undefined;
            }
            continue;
          }

          // Present models as a select list.
          const modelOptions = modelResult.models.map((id) => id);
          const selected = await ctx.ui.select(
            "Available Models",
            modelOptions,
          );

          if (selected) {
            config.model = selected;
          }
          persist();
          continue;
        }

        const newValue = await ctx.ui.input(settingKey, currentValue);
        if (newValue === undefined) {
          return; // User cancelled input.
        }

        if (settingKey === "maxTokens") {
          const parsed = parseInt(newValue.trim(), 10);
          config.maxTokens = parsed > 0 ? parsed : undefined;
        } else {
          config[settingKey] = newValue.trim() as (typeof config)[typeof settingKey];
        }

        persist();
      } while (choice);
    },
  });
}
