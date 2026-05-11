import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { DEFAULT_GIT_STATE, getGitRefreshInFlight, setGitRefreshInFlight, setGitState } from "./state.js";
import { parseBranchAb } from "./parseBranchAb.js";

/**
 * Refreshes the cached git state from `git status` porcelain output.
 *
 * @param exec Pi exec function.
 */
export async function refreshGitState(exec: ExtensionAPI["exec"]): Promise<void> {
  const inFlight = getGitRefreshInFlight();
  if (inFlight) return inFlight;

  const refreshPromise = (async () => {
    try {
      const result = await exec("git", ["status", "--porcelain=v2", "--branch"], { timeout: 5000 });
      if (!result || result.code !== 0) {
        setGitState({ ...DEFAULT_GIT_STATE });
        return;
      }

      let branch: string | null = null;
      let dirtyCount = 0;
      let ahead = 0;
      let behind = 0;

      for (const line of result.stdout.split(/\r?\n/)) {
        if (line.startsWith("# branch.head ")) {
          const head = line.slice("# branch.head ".length).trim();
          branch = head === "(detached)" ? "detached" : head;
          continue;
        }
        if (line.startsWith("# branch.ab ")) {
          const counts = parseBranchAb(line);
          ahead = counts.ahead;
          behind = counts.behind;
          continue;
        }
        if (line.startsWith("1 ") || line.startsWith("2 ") || line.startsWith("u ") || line.startsWith("? ")) {
          dirtyCount += 1;
        }
      }

      setGitState({ branch, dirtyCount, ahead, behind, isRepo: true });
    } catch {
      setGitState({ ...DEFAULT_GIT_STATE });
    } finally {
      setGitRefreshInFlight(null);
    }
  })();

  setGitRefreshInFlight(refreshPromise);
  return refreshPromise;
}
