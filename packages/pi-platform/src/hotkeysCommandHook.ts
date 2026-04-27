export type HotkeysCommandHook = (mode: unknown) => void | Promise<void>;

let hotkeysCommandHook: HotkeysCommandHook | undefined;

/**
 * Registers the Nexus-owned hotkeys command hook.
 *
 * @param hook Hook invoked when Pi handles /hotkeys.
 */
export function setHotkeysCommandHook(hook: HotkeysCommandHook | undefined): void {
  hotkeysCommandHook = hook;
}

/**
 * Returns the currently registered Nexus hotkeys command hook.
 *
 * @returns Active hook, when registered.
 */
export function getHotkeysCommandHook(): HotkeysCommandHook | undefined {
  return hotkeysCommandHook;
}
