export type GitState = {
  branch: string | null;
  dirtyCount: number;
  ahead: number;
  behind: number;
  isRepo: boolean;
};

export const DEFAULT_GIT_STATE: GitState = {
  branch: null,
  dirtyCount: 0,
  ahead: 0,
  behind: 0,
  isRepo: false,
};

let gitState: GitState = { ...DEFAULT_GIT_STATE };
let gitRefreshInFlight: Promise<void> | null = null;

/**
 * Returns the latest cached git state.
 *
 * @returns Cached git state.
 */
export function getGitState(): GitState {
  return gitState;
}

/**
 * Stores the latest cached git state.
 *
 * @param nextState Next git state.
 */
export function setGitState(nextState: GitState): void {
  gitState = nextState;
}

/**
 * Returns the current in-flight git refresh promise.
 *
 * @returns In-flight refresh promise.
 */
export function getGitRefreshInFlight(): Promise<void> | null {
  return gitRefreshInFlight;
}

/**
 * Stores the current in-flight git refresh promise.
 *
 * @param promise Refresh promise.
 */
export function setGitRefreshInFlight(promise: Promise<void> | null): void {
  gitRefreshInFlight = promise;
}
