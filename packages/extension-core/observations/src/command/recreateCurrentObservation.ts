import type {
	ExtensionCommandContext,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { runObservationRecreateCliCommand } from "./runObservationRecreateCliCommand";

/**
 * Recreates observations for the active session through the Nexus CLI path.
 *
 * @param ctx Pi extension context.
 * @returns True when recreation completed successfully.
 */
export async function recreateCurrentObservation(
	ctx: ExtensionContext | ExtensionCommandContext,
): Promise<boolean> {
	const sessionFile = ctx.sessionManager.getSessionFile();
	if (!sessionFile) {
		ctx.ui.notify("No current conversation found", "warning");
		return false;
	}

	ctx.ui.notify("Recreating observations…", "info");
	const result = await runObservationRecreateCliCommand(
		ctx.sessionManager.getSessionId(),
		ctx.cwd,
	);
	if (result.exitCode === 0) {
		ctx.ui.notify(result.stdout.trim() || "Recreated observations", "info");
		return true;
	}

	ctx.ui.notify(
		result.stderr.trim() || "Failed to recreate observations",
		"error",
	);
	return false;
}
