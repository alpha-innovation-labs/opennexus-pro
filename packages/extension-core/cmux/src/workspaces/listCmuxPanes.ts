import { runCmuxJsonCommand } from "../runtime/runCmuxJsonCommand";
import { normalizeCmuxBoolean } from "./normalizeCmuxBoolean";
import { normalizeCmuxIndex } from "./normalizeCmuxIndex";
import { normalizeCmuxString } from "./normalizeCmuxString";
import type { CmuxPane } from "./types";

type CmuxPanesOutput = {
	panes?: unknown[];
};

/**
 * Lists panes for one cmux workspace.
 *
 * @param workspaceRef Workspace ref accepted by cmux.
 * @returns Panes in the workspace.
 */
export async function listCmuxPanes(workspaceRef: string): Promise<CmuxPane[]> {
	const output = await runCmuxJsonCommand<CmuxPanesOutput>([
		"list-panes",
		"--workspace",
		workspaceRef,
	]);
	return (output.panes ?? [])
		.map((pane) => {
			const value = pane as Record<string, unknown>;
			return {
				id: normalizeCmuxString(value.id) || undefined,
				ref: normalizeCmuxString(value.ref),
				focused: normalizeCmuxBoolean(value.focused),
				index: normalizeCmuxIndex(value.index),
				surfaces: [],
			};
		})
		.filter((pane) => pane.ref.length > 0);
}
