import type { LoginAction, LoginActionGroup } from "./LoginAction.js";

export type LoginActionListRow =
	| { readonly kind: "heading"; readonly title: string }
	| { readonly kind: "action"; readonly action: LoginAction };

/**
 * Flattens grouped login actions into render rows.
 *
 * @param groups Login action groups.
 * @returns Rows containing headings and actions.
 */
export function flattenLoginActionGroups(groups: readonly LoginActionGroup[]): LoginActionListRow[] {
	return groups.flatMap((group) => [
		{ kind: "heading", title: group.title } satisfies LoginActionListRow,
		...group.actions.map((action) => ({ kind: "action", action }) satisfies LoginActionListRow),
	]);
}
