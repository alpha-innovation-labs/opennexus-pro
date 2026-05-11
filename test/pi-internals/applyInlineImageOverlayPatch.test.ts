import assert from "node:assert/strict";
import test from "node:test";
import { TUI, setCapabilities, resetCapabilitiesCache, type Component } from "../../node_modules/@earendil-works/pi-tui/dist/index.js";
import { applyInlineImageOverlayPatch } from "../../packages/pi-platform/src/inline-image-overlays/applyInlineImageOverlayPatch.js";
import { VirtualTerminal } from "../support/terminal/VirtualTerminal.js";

/**
 * Creates a terminal image protocol line for overlay regression tests.
 *
 * @returns Kitty inline-image escape sequence.
 */
function createKittyImageLine(): string {
	return "\x1b_Ga=T,f=100,q=2,c=20,r=3;AAAA\x1b\\";
}

/**
 * Creates a component that renders one inline-image row.
 *
 * @returns Component with an image protocol line.
 */
function createImageLineComponent(): Component {
	return {
		invalidate: () => {},
		render: () => [createKittyImageLine()],
	};
}

/**
 * Creates a component that renders modal text.
 *
 * @returns Component with visible overlay text.
 */
function createModalTextComponent(): Component {
	return {
		invalidate: () => {},
		render: () => ["Settings modal"],
	};
}

/**
 * Virtual terminal that records raw writes for escape-sequence assertions.
 */
class CapturingVirtualTerminal extends VirtualTerminal {
	readonly writes: string[] = [];

	/**
	 * Records and forwards terminal output.
	 *
	 * @param data Terminal output bytes.
	 */
	override write(data: string): void {
		this.writes.push(data);
		super.write(data);
	}
}

test("inline image overlay patch renders modal text over image rows", async () => {
	setCapabilities({ images: "kitty", trueColor: true, hyperlinks: true });
	applyInlineImageOverlayPatch();

	const terminal = new CapturingVirtualTerminal(80, 10);
	const tui = new TUI(terminal as never, false);
	tui.addChild(createImageLineComponent());
	tui.start();
	tui.showOverlay(createModalTextComponent(), { anchor: "top-left", width: 30 });
	tui.requestRender(true);
	await terminal.waitForRender();

	const viewportText = terminal.getViewport().join("\n");
	assert.match(viewportText, /Settings modal/);
	assert.equal(terminal.writes.some((write) => write.includes("\x1b_Ga=d,d=A\x1b\\")), true);

	tui.stop();
	resetCapabilitiesCache();
});
