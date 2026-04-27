import { SettingsManager } from "../../../../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js";
import { decodeBase64Arg } from "./decodeBase64Arg.js";
import type { InternalSlashHandler } from "./types.js";

/**
 * Persists the selected scoped-model set from the custom Nexus menu.
 *
 * @param args Command arguments.
 * @param ctx Command context.
 */
export const handleInternalScopedModelsCommand: InternalSlashHandler = async (args, ctx) => {
  const encoded = args.trim();
  const settings = SettingsManager.create(ctx.cwd);
  const raw = encoded ? decodeBase64Arg(encoded) : "";
  const values = raw ? raw.split("\n").filter(Boolean) : [];
  settings.setEnabledModels(values.length === 0 ? undefined : values);
  ctx.ui.notify(values.length === 0 ? "Scoped models cleared" : "Scoped models saved", "info");
};
