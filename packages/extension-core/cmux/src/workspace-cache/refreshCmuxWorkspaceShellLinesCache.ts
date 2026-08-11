import { loadFreshCmuxWorkspaceShellLines } from "../command/loadFreshCmuxWorkspaceShellLines";
import { cmuxWorkspaceShellLinesCache } from "./cmuxWorkspaceShellLinesCache";
import { isCmuxWorkspaceShellLinesCacheFresh } from "./isCmuxWorkspaceShellLinesCacheFresh";
import { setCmuxWorkspaceShellLinesCache } from "./setCmuxWorkspaceShellLinesCache";

/**
 * Refreshes cmux workspace shell lines while reusing fresh or pending cache work.
 *
 * @param force Whether to bypass cache freshness checks.
 * @returns Fresh or cached workspace shell lines.
 */
export async function refreshCmuxWorkspaceShellLinesCache(
	force = false,
): Promise<string[]> {
	if (
		!force &&
		cmuxWorkspaceShellLinesCache.lines &&
		isCmuxWorkspaceShellLinesCacheFresh(
			cmuxWorkspaceShellLinesCache.refreshedAt,
		)
	) {
		return cmuxWorkspaceShellLinesCache.lines;
	}
	if (cmuxWorkspaceShellLinesCache.pending)
		return cmuxWorkspaceShellLinesCache.pending;
	cmuxWorkspaceShellLinesCache.pending = loadFreshCmuxWorkspaceShellLines()
		.then((lines) => {
			setCmuxWorkspaceShellLinesCache(lines);
			return lines;
		})
		.finally(() => {
			delete cmuxWorkspaceShellLinesCache.pending;
		});
	return cmuxWorkspaceShellLinesCache.pending;
}
