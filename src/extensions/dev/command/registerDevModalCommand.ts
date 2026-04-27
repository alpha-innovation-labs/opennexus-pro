import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { showDevModal } from "../modal/showDevModal.js";

/**
 * Registers the /dev-modal command.
 *
 * @param pi Pi extension API.
 */
export function registerDevModalCommand(pi: ExtensionAPI): void {
  pi.registerCommand("dev-modal", {
    description: "Open a dev-only modal playground with switchable variations.",
    handler: async (_args, ctx) => {
      await showDevModal(ctx);
    },
  });
}
