import { InteractiveMode } from "../../../node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/interactive-mode.js";

let startupUpdateSilencePatchApplied = false;

/**
 * Disables Pi startup update notifications for this bundled app.
 */
export function applyStartupUpdateSilencePatch(): void {
  if (startupUpdateSilencePatchApplied) {
    return;
  }

  process.env.PI_SKIP_VERSION_CHECK = "1";

  const prototype = InteractiveMode.prototype as unknown as {
    checkForNewVersion?: () => Promise<string | undefined>;
    checkForPackageUpdates(): Promise<string[]>;
    showNewVersionNotification(newVersion: string): void;
    showPackageUpdateNotification(packages: string[]): void;
  };

  prototype.checkForNewVersion = async function checkForNewVersion(): Promise<string | undefined> {
    return undefined;
  };
  prototype.checkForPackageUpdates = async function checkForPackageUpdates(): Promise<string[]> {
    return [];
  };
  prototype.showNewVersionNotification = function showNewVersionNotification(_newVersion: string): void {
    return;
  };
  prototype.showPackageUpdateNotification = function showPackageUpdateNotification(_packages: string[]): void {
    return;
  };

  startupUpdateSilencePatchApplied = true;
}
