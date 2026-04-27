import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { shouldPrimeStartupResumeModal, startupResumeEnvVar } from "../../runtime/cli/normalizeResumeStartupArgs.js";
import { showStartupResumeModal } from "./features/menu/internal-commands/showStartupResumeModal.js";

/**
 * Opens the Nexus startup resume modal when the CLI was launched with the resume flag.
 *
 * @param reason Session start reason.
 * @param ctx Extension context.
 */
export async function primeStartupResumeModal(reason: string, ctx: ExtensionContext): Promise<void> {
  if (reason !== "startup" || !ctx.hasUI || !shouldPrimeStartupResumeModal()) return;
  delete process.env[startupResumeEnvVar];
  setTimeout(() => {
    void showStartupResumeModal(ctx);
  }, 0);
}
