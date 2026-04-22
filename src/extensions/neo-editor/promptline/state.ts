let requestPromptlineRender: (() => void) | undefined;
let promptlineInstalledForSession: string | null = null;
let usageRenderUnsubscribe: (() => void) | undefined;

/**
 * Stores the current promptline render callback.
 *
 * @param callback Render callback.
 */
export function setPromptlineRenderRequest(callback: (() => void) | undefined): void {
  requestPromptlineRender = callback;
}

/**
 * Returns the current promptline render callback.
 *
 * @returns Render callback.
 */
export function getPromptlineRenderRequest(): (() => void) | undefined {
  return requestPromptlineRender;
}

/**
 * Stores the session currently holding the promptline installation.
 *
 * @param sessionFile Session file path.
 */
export function setPromptlineInstalledForSession(sessionFile: string | null): void {
  promptlineInstalledForSession = sessionFile;
}

/**
 * Returns the installed promptline session key.
 *
 * @returns Session file key.
 */
export function getPromptlineInstalledForSession(): string | null {
  return promptlineInstalledForSession;
}

/**
 * Stores the active usage unsubscribe callback.
 *
 * @param unsubscribe Unsubscribe callback.
 */
export function setUsageRenderUnsubscribe(unsubscribe: (() => void) | undefined): void {
  usageRenderUnsubscribe = unsubscribe;
}

/**
 * Returns the active usage unsubscribe callback.
 *
 * @returns Unsubscribe callback.
 */
export function getUsageRenderUnsubscribe(): (() => void) | undefined {
  return usageRenderUnsubscribe;
}
