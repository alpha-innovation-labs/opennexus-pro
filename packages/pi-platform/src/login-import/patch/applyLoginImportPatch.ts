import { createLoginActionGroups } from "../ui/createLoginActionGroups.js";
import { createLoginImportActionGroups } from "../ui/createLoginImportActionGroups.js";
import { GroupedLoginActionSelector } from "../ui/GroupedLoginActionSelector.js";
import { runAuthImportFlow } from "../flow/runAuthImportFlow.js";
import type { LoginImportInteractiveMode } from "../model/LoginImportInteractiveMode.js";

let loginImportPatchApplied = false;

type InteractiveModeConstructor = { prototype: unknown };

type PatchedInteractiveMode = LoginImportInteractiveMode & {
	showSelector(create: (done: () => void) => { component: unknown; focus: unknown }): void;
	showLoginAuthTypeSelector(): void;
	showLoginProviderSelector(authType: "oauth" | "api_key"): void;
};

/**
 * Replaces Pi's top-level /login choice with Nexus import and provider groups.
 */
export async function applyLoginImportPatch(): Promise<void> {
	if (loginImportPatchApplied) return;
	const piCodingAgent = (await import("@mariozechner/pi-coding-agent")) as { InteractiveMode: InteractiveModeConstructor };
	const prototype = piCodingAgent.InteractiveMode.prototype as unknown as PatchedInteractiveMode;
	prototype.showLoginAuthTypeSelector = function showLoginAuthTypeSelector(this: PatchedInteractiveMode): void {
		this.showSelector((done: () => void) => {
			const selector = new GroupedLoginActionSelector(
				"Select authentication action:",
				createLoginActionGroups(),
				(action) => {
					done();
					if (action.kind === "import-menu") {
						showLoginImportSourceSelector(this);
						return;
					}
					if (action.kind === "provider") {
						this.showLoginProviderSelector(action.authType);
						return;
					}
					void runAuthImportFlow(this, action.source);
				},
				() => {
					done();
					this.ui.requestRender();
				},
			);
			return { component: selector, focus: selector };
		});
	};
	loginImportPatchApplied = true;
}

/**
 * Opens the import-source submenu for the patched /login selector.
 *
 * @param mode Active interactive mode instance.
 */
function showLoginImportSourceSelector(mode: PatchedInteractiveMode): void {
	mode.showSelector((done: () => void) => {
		const selector = new GroupedLoginActionSelector(
			"Select import source:",
			createLoginImportActionGroups(),
			(action) => {
				done();
				if (action.kind === "import") {
					void runAuthImportFlow(mode, action.source);
				}
			},
			() => {
				done();
				mode.ui.requestRender();
			},
		);
		return { component: selector, focus: selector };
	});
}
