import { Container, Spacer, Text } from "@earendil-works/pi-tui";
import type { LoginImportInteractiveMode } from "../model/LoginImportInteractiveMode.js";

let loginImportPatchApplied = false;

type InteractiveModeConstructor = { prototype: unknown };

type PatchedInteractiveMode = LoginImportInteractiveMode & {
	showSelector(create: (done: () => void) => { component: unknown; focus: unknown }): void;
	showLoginAuthTypeSelector(): void;
	showLoginProviderSelector(authType: "oauth" | "api_key"): void;
};

/**
 * Replaces Pi's /login with a simple "Hello World" modal.
 *
 * Both `showLoginAuthTypeSelector` and `showLoginProviderSelector` are
 * overwritten so that any path into /login — whether the user typed
 * `/login` and hit Enter, or navigated through the slash menu —
 * lands on this single static screen.
 */
export async function applyLoginImportPatch(): Promise<void> {
	if (loginImportPatchApplied) return;
	const piCodingAgent = (await import("@earendil-works/pi-coding-agent")) as { InteractiveMode: InteractiveModeConstructor };
	const prototype = piCodingAgent.InteractiveMode.prototype as unknown as PatchedInteractiveMode;

	const helloWorldComponent = createHelloWorldComponent();

	prototype.showLoginAuthTypeSelector = function showLoginAuthTypeSelector(this: PatchedInteractiveMode): void {
		this.showSelector((done: () => void) => {
			return { component: helloWorldComponent, focus: helloWorldComponent };
		});
	};

	prototype.showLoginProviderSelector = function showLoginProviderSelector(this: PatchedInteractiveMode, _authType: "oauth" | "api_key"): void {
		this.showSelector((done: () => void) => {
			return { component: helloWorldComponent, focus: helloWorldComponent };
		});
	};

	loginImportPatchApplied = true;
}

/**
 * Creates a static "Hello World" modal component.
 *
 * @returns A container displaying "Hello World".
 */
function createHelloWorldComponent(): Container {
	const container = new Container();
	container.addChild(new Text("Hello World", 1, 0));
	return container;
}
