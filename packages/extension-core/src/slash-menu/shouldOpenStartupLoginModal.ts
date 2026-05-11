import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

/**
 * Checks whether startup should prompt the user to configure a provider.
 *
 * @param reason Session start reason.
 * @param ctx Extension context with UI and model registry.
 * @returns True when a fresh UI startup has no authenticated models.
 */
export function shouldOpenStartupLoginModal(reason: string, ctx: ExtensionContext): boolean {
  if (reason !== "startup") return false;
  if (!ctx.hasUI) return false;
  return ctx.modelRegistry.getAvailable().length === 0;
}
