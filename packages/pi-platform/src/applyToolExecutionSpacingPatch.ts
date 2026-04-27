import { Spacer } from "@mariozechner/pi-tui";
import { ToolExecutionComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/tool-execution.js";

const LEADING_SPACER_SKIPPED = Symbol("toolExecutionLeadingSpacerSkipped");
let toolExecutionSpacingPatchApplied = false;

/**
 * Removes Pi's default leading spacer for tool executions that explicitly opt out.
 */
export function applyToolExecutionSpacingPatch(): void {
  if (toolExecutionSpacingPatchApplied) {
    return;
  }

  const prototype = ToolExecutionComponent.prototype as unknown as {
    addChild(child: unknown): void;
    toolDefinition?: { skipLeadingSpacer?: boolean };
    [LEADING_SPACER_SKIPPED]?: boolean;
  };
  const originalAddChild = prototype.addChild;

  prototype.addChild = function addChildWithoutLeadingSpacer(child: unknown): void {
    if (
      this.toolDefinition?.skipLeadingSpacer === true &&
      this[LEADING_SPACER_SKIPPED] !== true &&
      child instanceof Spacer
    ) {
      this[LEADING_SPACER_SKIPPED] = true;
      return;
    }

    originalAddChild.call(this, child);
  };

  toolExecutionSpacingPatchApplied = true;
}
