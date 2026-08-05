import stripAnsi from "strip-ansi";

/**
 * Sanitizes a string by filtering out control/Unicode format characters
 * that cause string-width to crash. Copies the upstream implementation from
 * @earendil-works/pi-coding-agent/dist/utils/shell.js (not exported from the
 * package's public API).
 */
function sanitizeBinaryOutput(str: string): string {
	return Array.from(str)
		.filter((char) => {
			const code = char.codePointAt(0);
			if (code === undefined) return false;
			if (code === 0x09 || code === 0x0a || code === 0x0d) return true;
			if (code <= 0x1f) return false;
			if (code >= 0xfff9 && code <= 0xfffb) return false;
			return true;
		})
		.join("");
}
import { ToolExecutionComponent } from "@earendil-works/pi-coding-agent";
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
