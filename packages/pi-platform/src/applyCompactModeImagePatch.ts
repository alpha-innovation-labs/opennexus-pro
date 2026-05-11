import stripAnsi from "strip-ansi";
import { sanitizeBinaryOutput } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/utils/shell.js";
import { ToolExecutionComponent } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";
import { isToolGroupCollapseEnabled } from "@nexus/extensions/tron/collapse/state.ts";

let compactModeImagePatchApplied = false;

type ToolExecutionComponentWithCompactImagePatch = {
	showImages: boolean;
	result?: { content?: Array<{ type?: string; text?: string }> };
	updateDisplay(): void;
	getTextOutput(): string;
};

/**
 * Hides tool-result images and image placeholders while Tron compact mode is active.
 */
export function applyCompactModeImagePatch(): void {
	if (compactModeImagePatchApplied) return;

	const prototype = ToolExecutionComponent.prototype as unknown as ToolExecutionComponentWithCompactImagePatch;
	const originalUpdateDisplay = prototype.updateDisplay;
	const originalGetTextOutput = prototype.getTextOutput;

	prototype.updateDisplay = function updateDisplayWithoutCompactModeImages(): void {
		if (!isToolGroupCollapseEnabled()) {
			originalUpdateDisplay.call(this);
			return;
		}

		const previousShowImages = this.showImages;
		this.showImages = false;
		try {
			originalUpdateDisplay.call(this);
		} finally {
			this.showImages = previousShowImages;
		}
	};

	prototype.getTextOutput = function getTextOutputWithoutCompactModeImages(): string {
		if (!isToolGroupCollapseEnabled()) return originalGetTextOutput.call(this);
		const textBlocks = this.result?.content?.filter((block) => block?.type === "text") ?? [];
		return textBlocks
			.map((block) => sanitizeBinaryOutput(stripAnsi(block.text || "")).replace(/\r/g, ""))
			.join("\n");
	};

	compactModeImagePatchApplied = true;
}
