import type { ExtensionFeatureFlag } from "./types";

const runtimeExtensionFeatureState = new Map<string, boolean>();

/**
 * Replaces the in-memory runtime extension feature state.
 *
 * @param flags Effective extension feature flags.
 */
export function setRuntimeExtensionFeatureFlags(flags: Pick<ExtensionFeatureFlag, "id" | "enabled">[]): void {
  runtimeExtensionFeatureState.clear();
  for (const flag of flags) runtimeExtensionFeatureState.set(flag.id, flag.enabled);
}

/**
 * Sets one runtime extension feature state entry.
 *
 * @param id Extension feature id.
 * @param enabled Whether the extension feature is enabled.
 */
export function setRuntimeExtensionFeatureState(id: string, enabled: boolean): void {
  runtimeExtensionFeatureState.set(id, enabled);
}

/**
 * Reads whether one extension feature is enabled at runtime.
 *
 * @param id Extension feature id.
 * @param defaultEnabled Fallback when state was not initialized.
 * @returns Whether the extension feature is enabled.
 */
export function isRuntimeExtensionFeatureEnabled(id: string, defaultEnabled = true): boolean {
  return runtimeExtensionFeatureState.get(id) ?? defaultEnabled;
}
