import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SlashMenuLevel } from "./SlashMenuLevel.js";

/**
 * Redirects model selection to login when no authenticated models are available.
 *
 * @param ctx Extension context with the live model registry.
 * @param requestedLevel Requested slash-menu level.
 * @returns The level that should be opened.
 */
export function resolveRequestedSlashMenuLevel(ctx: ExtensionContext, requestedLevel: SlashMenuLevel): SlashMenuLevel {
  if (requestedLevel !== "model") return requestedLevel;
  return ctx.modelRegistry.getAvailable().length === 0 ? "login" : "model";
}
