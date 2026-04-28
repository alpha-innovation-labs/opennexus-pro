import { FooterComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/footer.js";

type FooterWithPatch = { __nexusModelChangeDisplayPatched__?: boolean; render(width: number): string[] };

/**
 * Hides Pi's built-in model footer so Neo owns the below-editor model line.
 */
export function applyModelChangeDisplayPatch(): void {
	const prototype = FooterComponent.prototype as FooterWithPatch;
	if (prototype.__nexusModelChangeDisplayPatched__) return;
	prototype.render = function renderWithoutPiModelFooter(): string[] {
		return [];
	};
	prototype.__nexusModelChangeDisplayPatched__ = true;
}
