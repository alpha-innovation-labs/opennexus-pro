import type { ExtensionContext } from "@mariozechner/pi-coding-agent";

let promptlineModelOverride: ExtensionContext["model"] | undefined;
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
 * Stores the promptline model selected before the context getter refreshes.
 *
 * @param model Model to render, or undefined to use the context model.
 */
export function setPromptlineModelOverride(model: ExtensionContext["model"] | undefined): void {
  promptlineModelOverride = model;
}

/**
 * Returns the promptline model selected before the context getter refreshes.
 *
 * @returns Promptline model override.
 */
export function getPromptlineModelOverride(): ExtensionContext["model"] | undefined {
  return promptlineModelOverride;
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
