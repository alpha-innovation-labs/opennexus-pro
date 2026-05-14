import type { ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { DEFAULT_OBSERVATION_RECREATION_PROMPT_TEMPLATE } from "../shared/defaultObservationRecreationPromptTemplate.js";
import { readObservationPromptOverride } from "../shared/readObservationPromptOverride.js";
import { writeObservationPromptOverride } from "../shared/writeObservationPromptOverride.js";

/**
 * Opens the prompt editor and persists the observation prompt override.
 *
 * @param ctx Pi extension context.
 */
export async function editObservationPrompt(ctx: ExtensionContext | ExtensionCommandContext): Promise<void> {
	const currentPrompt = await readObservationPromptOverride() ?? DEFAULT_OBSERVATION_RECREATION_PROMPT_TEMPLATE;
	const nextPrompt = await ctx.ui.editor("Edit observation prompt", currentPrompt);
	if (nextPrompt === undefined) return;
	await writeObservationPromptOverride(nextPrompt);
	ctx.ui.notify(nextPrompt.trim() ? "Observation prompt override saved" : "Observation prompt override cleared", "info");
}
