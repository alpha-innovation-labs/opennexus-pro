import type { WorkingIndicatorOptions } from "@mariozechner/pi-coding-agent";

/**
 * Shared Pi working-indicator animation for foreground prompt execution.
 */
export const subagentStatusWidgetIndicator: WorkingIndicatorOptions = {
  frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  intervalMs: 100,
};
