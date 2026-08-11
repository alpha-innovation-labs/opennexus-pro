import { runCmuxJsonCommand } from "../runtime/runCmuxJsonCommand";
import { normalizeCmuxBoolean } from "./normalizeCmuxBoolean";
import { normalizeCmuxIndex } from "./normalizeCmuxIndex";
import { normalizeCmuxString } from "./normalizeCmuxString";
import type { CmuxSurface } from "./types";

type CmuxPaneSurfacesOutput = {
	surfaces?: unknown[];
};

/**
 * Lists terminal and browser surfaces for one cmux pane.
 *
 * @param workspaceRef Workspace ref accepted by cmux.
 * @param paneRef Pane ref accepted by cmux.
 * @returns Surfaces in the pane.
 */
export async function listCmuxPaneSurfaces(
	workspaceRef: string,
	paneRef: string,
): Promise<CmuxSurface[]> {
	const output = await runCmuxJsonCommand<CmuxPaneSurfacesOutput>([
		"list-pane-surfaces",
		"--workspace",
		workspaceRef,
		"--pane",
		paneRef,
	]);
	return (output.surfaces ?? [])
		.map((surface) => {
			const value = surface as Record<string, unknown>;
			return {
				id: normalizeCmuxString(value.id) || undefined,
				ref: normalizeCmuxString(value.ref),
				title: normalizeCmuxString(value.title) || "Untitled shell",
				type: normalizeCmuxString(value.type) || "terminal",
				selected: normalizeCmuxBoolean(value.selected),
				index: normalizeCmuxIndex(value.index),
			};
		})
		.filter((surface) => surface.ref.length > 0);
}
