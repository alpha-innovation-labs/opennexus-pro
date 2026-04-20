import { InteractiveMode } from "../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/interactive-mode.js";

let startupUpdateSilencePatchApplied = false;

/**
 * Disables Pi startup update notifications for this bundled app.
 */
export function applyStartupUpdateSilencePatch(): void {
  if (startupUpdateSilencePatchApplied) {
    return;
  }

  const prototype = InteractiveMode.prototype as InteractiveMode & {
    checkForNewVersion(): Promise<string | undefined>;
    checkForPackageUpdates(): Promise<string[]>;
  };

  prototype.checkForNewVersion = async function checkForNewVersion(): Promise<string | undefined> {
    return undefined;
  };
  prototype.checkForPackageUpdates = async function checkForPackageUpdates(): Promise<string[]> {
    return [];
  };

  startupUpdateSilencePatchApplied = true;
}
