import { runCmuxJsonCommand } from "../runtime/runCmuxJsonCommand";
import { normalizeCmuxBoolean } from "./normalizeCmuxBoolean";
import { normalizeCmuxIndex } from "./normalizeCmuxIndex";
import { normalizeCmuxString } from "./normalizeCmuxString";
import type { CmuxWorkspace } from "./types";

type CmuxWorkspacesOutput = {
	workspaces?: unknown[];
};

/**
 * Lists cmux workspaces from the active cmux window.
 *
 * @returns Workspaces with stable ids and display metadata.
 */
export async function listCmuxWorkspaces(): Promise<CmuxWorkspace[]> {
	const output = await runCmuxJsonCommand<CmuxWorkspacesOutput>(["list-workspaces"]);
	return (output.workspaces ?? []).map((workspace) => {
		const value = workspace as Record<string, unknown>;
		return {
			id: normalizeCmuxString(value.id) || undefined,
			ref: normalizeCmuxString(value.ref),
			title: normalizeCmuxString(value.title) || "Untitled workspace",
			selected: normalizeCmuxBoolean(value.selected),
			index: normalizeCmuxIndex(value.index),
			panes: [],
		};
	}).filter((workspace) => workspace.ref.length > 0);
}
