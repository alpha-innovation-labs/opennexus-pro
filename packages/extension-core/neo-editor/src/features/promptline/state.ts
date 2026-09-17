import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

let promptlineModelOverride: ExtensionContext["model"] | undefined;
let requestPromptlineRender: ((force?: boolean) => void) | undefined;
let promptlineInstalledForSession: string | null = null;
let refreshRequestCallback: (() => void) | undefined;
let usageRenderUnsubscribe: (() => void) | undefined;
let providerPickerOpener: (() => void) | undefined;

/** Connects metadata clicks to the active editor's existing slash-menu UI. */
export function setPromptlineProviderPickerOpener(opener: (() => void) | undefined): void {
	providerPickerOpener = opener;
}

export function openPromptlineProviderPicker(): void {
	providerPickerOpener?.();
}

/**
 * Stores the current promptline render callback.
 *
 * @param callback Render callback.
 */
export function setPromptlineRenderRequest(
	callback: ((force?: boolean) => void) | undefined,
): void {
	requestPromptlineRender = callback;
}

/**
 * Returns the current promptline render callback.
 *
 * @returns Render callback.
 */
export function getPromptlineRenderRequest():
	| ((force?: boolean) => void)
	| undefined {
	return requestPromptlineRender;
}

/**
 * Stores the promptline model selected before the context getter refreshes.
 *
 * @param model Model to render, or undefined to use the context model.
 */
export function setPromptlineModelOverride(
	model: ExtensionContext["model"] | undefined,
): void {
	promptlineModelOverride = model;
}

/**
 * Returns the promptline model selected before the context getter refreshes.
 *
 * @returns Promptline model override.
 */
export function getPromptlineModelOverride():
	| ExtensionContext["model"]
	| undefined {
	return promptlineModelOverride;
}

/**
 * Stores the session currently holding the promptline installation.
 *
 * @param sessionFile Session file path.
 */
export function setPromptlineInstalledForSession(
	sessionFile: string | null,
): void {
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
 * Stores the promptline refresh request callback.
 *
 * @param callback Refresh callback.
 */
export function setRefreshRequestCallback(
	callback: (() => void) | undefined,
): void {
	refreshRequestCallback = callback;
}

/**
 * Returns the promptline refresh request callback.
 *
 * @returns Refresh callback.
 */
export function getRefreshRequestCallback(): (() => void) | undefined {
	return refreshRequestCallback;
}

/**
 * Stores the active usage unsubscribe callback.
 *
 * @param unsubscribe Unsubscribe callback.
 */
export function setUsageRenderUnsubscribe(
	unsubscribe: (() => void) | undefined,
): void {
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
