import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { shouldPrimeStartupUsageModal, startupUsageEnvVar } from "@nexus/runtime/cli/normalizeUsageStartupArgs.js";
import { showUsageHistoryModal } from "./history-modal/showUsageHistoryModal.js";

/**
 * Opens the usage history modal when Nexus was launched with --usage.
 *
 * @param reason Session start reason.
 * @param ctx Extension context.
 */
export async function primeStartupUsageModal(reason: string, ctx: ExtensionContext): Promise<void> {
  if (reason !== "startup" || !ctx.hasUI || !shouldPrimeStartupUsageModal()) return;
  delete process.env[startupUsageEnvVar];
  setTimeout(() => {
    void showUsageHistoryModal(ctx);
  }, 0);
}
