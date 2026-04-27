import { KEYBINDINGS } from "../../node_modules/@mariozechner/pi-coding-agent/dist/core/keybindings.js";

type MutableKeybinding = { defaultKeys: string | string[]; description: string };

let modelKeybindingsPatchApplied = false;

/**
 * Disables Pi's default model picker/cycling shortcuts for Nexus.
 */
export function applyModelKeybindingsPatch(): void {
	if (modelKeybindingsPatchApplied) return;
	const keybindings = KEYBINDINGS as unknown as Record<string, MutableKeybinding>;
	keybindings["app.model.select"].defaultKeys = [];
	keybindings["app.model.cycleForward"].defaultKeys = [];
	keybindings["app.model.cycleBackward"].defaultKeys = [];
	modelKeybindingsPatchApplied = true;
}
