import { logStartupProfileEvent } from "@nexus/observability/startup-profile/logStartupProfileEvent.js";

type CursorStoredModelLoaderState = {
	loader?: () => Promise<void>;
	promise?: Promise<void>;
	loaded: boolean;
};

const cursorStoredModelLoaderStateKey = Symbol.for("nexus.cursorStoredModelLoaderState");

/**
 * Returns the process-wide Cursor loader state shared across bundled module copies.
 *
 * @returns Shared Cursor stored-model loader state.
 */
function getCursorStoredModelLoaderState(): CursorStoredModelLoaderState {
	const globalState = globalThis as typeof globalThis & { [cursorStoredModelLoaderStateKey]?: CursorStoredModelLoaderState };
	globalState[cursorStoredModelLoaderStateKey] ??= { loaded: false };
	return globalState[cursorStoredModelLoaderStateKey];
}

/**
 * Stores the deferred Cursor model loader captured during provider registration.
 *
 * @param loader Loader that registers live Cursor models from stored credentials.
 */
export function setStoredCursorModelLoader(loader: () => Promise<void>): void {
	const state = getCursorStoredModelLoaderState();
	state.loader = loader;
	state.promise = undefined;
	state.loaded = false;
	logStartupProfileEvent("ai-providers", "cursorStoredModelLoader:set");
}

/**
 * Loads Cursor models from stored credentials once, when the model menu needs them.
 */
export async function ensureStoredCursorModelsRegistered(): Promise<void> {
	const state = getCursorStoredModelLoaderState();
	if (state.loaded) {
		logStartupProfileEvent("ai-providers", "cursorStoredModelLoader:alreadyLoaded");
		return;
	}
	if (!state.loader) {
		logStartupProfileEvent("ai-providers", "cursorStoredModelLoader:missing");
		return;
	}
	const startedAt = performance.now();
	state.promise ??= state.loader().then(() => {
		state.loaded = true;
	});
	await state.promise;
	logStartupProfileEvent("ai-providers", "cursorStoredModelLoader:loaded", {
		durationMs: Number((performance.now() - startedAt).toFixed(3)),
	});
}

/**
 * Clears the deferred Cursor model loader for isolated tests.
 */
export function resetStoredCursorModelLoaderForTests(): void {
	const state = getCursorStoredModelLoaderState();
	state.loader = undefined;
	state.promise = undefined;
	state.loaded = false;
}
