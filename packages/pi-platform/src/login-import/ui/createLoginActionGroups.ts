import type { LoginActionGroup } from "./LoginAction.js";

/**
 * Creates the grouped /login top-level actions.
 *
 * @returns Login action groups for import and provider setup.
 */
export function createLoginActionGroups(): LoginActionGroup[] {
	return [
		{
			title: "Import",
			actions: [],
		},
		{
			title: "Providers",
			actions: [
				{ kind: "provider", authType: "oauth", label: "Use a subscription" },
				{ kind: "provider", authType: "api_key", label: "Use an API key" },
			],
		},
	];
}
