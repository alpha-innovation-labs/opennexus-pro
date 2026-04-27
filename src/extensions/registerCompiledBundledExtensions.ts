import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import registerCompiledEnabledExtensions from "./generated/registerCompiledEnabledExtensions.js";
import { registerInternalSlashSelectorCommands } from "./neo-editor/features/menu/internal-commands/registerInternalSlashSelectorCommands.js";
import { registerSlashCommand } from "./neo-editor/features/menu/registerSlashCommand.js";

/**
 * Registers the release-bundled extension set compiled from feature-flags.json.
 *
 * @param pi Pi extension API.
 */
export default function registerCompiledBundledExtensions(pi: ExtensionAPI): void {
  const slashAwarePi = new Proxy(pi, {
    get(target, property, receiver) {
      if (property === "registerCommand") {
        return (name: string, definition: Record<string, unknown>) => {
          registerSlashCommand({
            name,
            description: typeof definition.description === "string" ? definition.description : undefined,
            source: "extension",
            handler: typeof definition.handler === "function" ? definition.handler as never : undefined,
          });
          return target.registerCommand(name, definition as never);
        };
      }
      return Reflect.get(target, property, receiver);
    },
  });

  registerInternalSlashSelectorCommands(pi);
  registerCompiledEnabledExtensions(slashAwarePi);
}
