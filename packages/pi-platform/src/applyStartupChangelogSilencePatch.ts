import { InteractiveMode } from "@earendil-works/pi-coding-agent/dist/modes/interactive/interactive-mode.js";

let startupChangelogSilencePatchApplied = false;

/**
 * Disables Pi startup changelog rendering and related install telemetry.
 */
export function applyStartupChangelogSilencePatch(): void {
  if (startupChangelogSilencePatchApplied) {
    return;
  }

  const prototype = InteractiveMode.prototype as unknown as {
    getChangelogForDisplay(): string | undefined;
    reportInstallTelemetry(version: string): void;
  };

  prototype.getChangelogForDisplay = function getChangelogForDisplay(): string | undefined {
    return undefined;
  };

  prototype.reportInstallTelemetry = function reportInstallTelemetry(_version: string): void {
    return;
  };

  startupChangelogSilencePatchApplied = true;
}
