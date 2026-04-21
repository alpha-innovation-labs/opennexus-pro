import type { SubagentRun } from "../types.js";

/**
 * Creates the shared in-memory runtime registry for all subagent runs.
 *
 * @returns Mutable runtime registry.
 */
export function createSubagentRuntime() {
  const runs = new Map<string, SubagentRun>();
  const listeners = new Set<() => void>();

  const notify = (): void => {
    for (const listener of listeners) listener();
  };

  return {
    /**
     * Stores one run.
     *
     * @param run Run state.
     */
    setRun(run: SubagentRun): void {
      runs.set(run.id, run);
      notify();
    },
    /**
     * Reads one run by id.
     *
     * @param id Run identifier.
     * @returns Run, if found.
     */
    getRun(id: string): SubagentRun | undefined {
      return runs.get(id);
    },
    /**
     * Lists runs newest first.
     *
     * @returns All tracked runs.
     */
    listRuns(): SubagentRun[] {
      return [...runs.values()].sort((left, right) => right.createdAt - left.createdAt);
    },
    /**
     * Notifies observers after a mutation.
     */
    emit(): void {
      notify();
    },
    /**
     * Subscribes to runtime changes.
     *
     * @param listener Change listener.
     * @returns Unsubscribe function.
     */
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
