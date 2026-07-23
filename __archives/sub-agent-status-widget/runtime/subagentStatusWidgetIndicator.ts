import type { WorkingIndicatorOptions } from "@earendil-works/pi-coding-agent";

/**
 * Shared Pi working-indicator animation for foreground prompt execution.
 */
export const subagentStatusWidgetIndicator: WorkingIndicatorOptions = {
  frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  intervalMs: 100,
};
