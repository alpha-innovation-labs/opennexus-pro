import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { shouldOpenStartupLoginModal } from "./features/menu/shouldOpenStartupLoginModal.js";
import { showStartupLoginModal } from "./features/menu/internal-commands/showStartupLoginModal.js";

/**
 * Opens the Nexus startup login modal when no provider is configured.
 *
 * @param reason Session start reason.
 * @param ctx Extension context.
 */
export async function primeStartupLoginModal(reason: string, ctx: ExtensionContext): Promise<void> {
  if (!shouldOpenStartupLoginModal(reason, ctx)) return;
  setTimeout(() => {
    void showStartupLoginModal(ctx);
  }, 0);
}
