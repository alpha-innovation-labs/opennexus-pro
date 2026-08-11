import { setHotkeysCommandHook } from "@nexus/pi-platform/hotkeysCommandHook";

/** Clears the hotkeys override for Pi's built-in /hotkeys command. */
export function clearHotkeysCommandHook(): void {
	setHotkeysCommandHook(undefined);
}
