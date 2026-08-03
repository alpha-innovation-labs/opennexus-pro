import { Spacer } from "@earendil-works/pi-tui";
import { ToolExecutionComponent } from "@earendil-works/pi-coding-agent";

const LEADING_SPACER_SKIPPED = Symbol("toolExecutionLeadingSpacerSkipped");
let toolExecutionSpacingPatchApplied = false;

/**
 * Removes Pi's default leading spacer for every tool execution.
 */
export function applyToolExecutionSpacingPatch(): void {
  if (toolExecutionSpacingPatchApplied) {
    return;
  }

  const prototype = ToolExecutionComponent.prototype as unknown as {
    addChild(child: unknown): void;
    render(width: number): string[];
    [LEADING_SPACER_SKIPPED]?: boolean;
  };
  const originalAddChild = prototype.addChild;
  const originalRender = prototype.render;

  prototype.addChild = function addChildWithoutLeadingSpacer(child: unknown): void {
    if (this[LEADING_SPACER_SKIPPED] !== true && child instanceof Spacer) {
      this[LEADING_SPACER_SKIPPED] = true;
      return;
    }

    originalAddChild.call(this, child);
  };

  // Strip the unconditional blank line that self-rendering tools prepend.
  // The upstream ToolExecutionComponent.render() always does
  //   lines.push("");
  //   lines.push(...contentLines);
  // when getRenderShell() === "self", which injects one blank line
  // between every consecutive tool call in the compact Tron view.
  prototype.render = function renderWithoutLeadingBlankLine(width: number): string[] {
    const lines = originalRender.call(this, width);
    // Remove the leading empty string that self-rendering tools inject.
    if (lines.length > 0 && lines[0] === "") {
      return lines.slice(1);
    }
    return lines;
  };

  toolExecutionSpacingPatchApplied = true;
}
