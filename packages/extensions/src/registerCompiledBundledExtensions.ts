import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import registerCompiledEnabledExtensions from "./generated/registerCompiledEnabledExtensions.js";
import { registerWhichKeyCommandHook } from "./neo-editor/features/which-key/registerWhichKeyCommandHook.js";
import { registerInternalSlashSelectorCommands } from "./neo-editor/features/menu/internal-commands/registerInternalSlashSelectorCommands.js";
import { registerSlashCommand } from "./neo-editor/features/menu/registerSlashCommand.js";
import { registerTelemetryRuntimeExtension } from "./telemetry-runtime/registerTelemetryRuntimeExtension.js";
import { applySystemExtensionAvailability } from "@nexus/feature-flags/applySystemExtensionAvailability.js";
import { applyUserExtensionConfig } from "@nexus/feature-flags/applyUserExtensionConfig.js";
import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";
import { createTronToolWrappingExtensionApi } from "./tron/compact-tool-lines/createTronToolWrappingExtensionApi.js";
import { recordRegisteredShortcut } from "@nexus/tui-kit/shortcuts/recordRegisteredShortcut.js";

/**
 * Registers the release-bundled extension set compiled from feature-flags.json.
 *
 * @param pi Pi extension API.
 */
export default async function registerCompiledBundledExtensions(pi: ExtensionAPI): Promise<void> {
  const config = applySystemExtensionAvailability(applyUserExtensionConfig(getBundledFeatureFlagsConfig()));
  const toolAwarePi = config.extensions.tron?.enabled ? createTronToolWrappingExtensionApi(pi) : pi;
  const slashAwarePi = new Proxy(toolAwarePi, {
    get(target, property, receiver) {
      if (property === "registerCommand") {
        return (name: string, definition: Record<string, unknown>) => {
          registerSlashCommand({
            name,
            description: typeof definition.description === "string" ? definition.description : undefined,
            source: "extension",
            menuGroup: typeof definition.menuGroup === "string" ? definition.menuGroup : undefined,
            handler: typeof definition.handler === "function" ? definition.handler as never : undefined,
          });
          return target.registerCommand(name, definition as never);
        };
      }
      if (property === "registerShortcut") {
        return (shortcut: string, definition: Record<string, unknown>) => {
          recordRegisteredShortcut(shortcut, definition);
          return target.registerShortcut(shortcut as never, definition as never);
        };
      }
      return Reflect.get(target, property, receiver);
    },
  });

  registerWhichKeyCommandHook();
  registerInternalSlashSelectorCommands(pi);
  registerTelemetryRuntimeExtension(pi);
  await registerCompiledEnabledExtensions(slashAwarePi);
}
