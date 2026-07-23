import type { ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { TUI } from "@earendil-works/pi-tui";
import { DEFAULT_OBSERVATION_RECREATION_PROMPT_TEMPLATE } from "../shared/defaultObservationRecreationPromptTemplate.js";
import { readObservationPromptOverride } from "../shared/readObservationPromptOverride.js";
import { writeObservationPromptOverride } from "../shared/writeObservationPromptOverride.js";
import { openObservationPromptExternalEditor } from "./openObservationPromptExternalEditor.js";

/**
 * Opens the external editor and persists the observation prompt override.
 *
 * @param ctx Pi extension context.
 * @param tui TUI instance to stop while the editor owns the terminal.
 */
export async function editObservationPrompt(ctx: ExtensionContext | ExtensionCommandContext, tui: TUI): Promise<void> {
	const currentPrompt = await readObservationPromptOverride() ?? DEFAULT_OBSERVATION_RECREATION_PROMPT_TEMPLATE;
	const nextPrompt = openObservationPromptExternalEditor(tui, currentPrompt);
	if (nextPrompt === undefined) {
		ctx.ui.notify("Set EDITOR to edit the observation prompt", "warning");
		return;
	}
	await writeObservationPromptOverride(nextPrompt);
	ctx.ui.notify(nextPrompt.trim() ? "Observation prompt override saved" : "Observation prompt override cleared", "info");
}
