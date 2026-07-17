import type { LoginActionGroup } from "./LoginAction.js";

/**
 * Creates the /login import submenu actions.
 *
 * @returns Login action group for supported import sources.
 */
export function createLoginImportActionGroups(): LoginActionGroup[] {
	return [
		{
			title: "Import",
			actions: [],
		},
	];
}
