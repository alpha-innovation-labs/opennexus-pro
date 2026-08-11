import { Key, matchesKey } from "@earendil-works/pi-tui";

/**
 * Checks whether the current key should be routed to the `@` modal.
 *
 * @param data Raw input payload.
 * @returns True when the key belongs to the `@` modal.
 */
export function shouldRouteToAtModal(data: string): boolean {
	return (
		matchesKey(data, Key.up) ||
		matchesKey(data, Key.down) ||
		matchesKey(data, Key.enter) ||
		matchesKey(data, Key.escape) ||
		matchesKey(data, Key.ctrl("n")) ||
		matchesKey(data, Key.ctrl("p")) ||
		matchesKey(data, Key.ctrl("c"))
	);
}
