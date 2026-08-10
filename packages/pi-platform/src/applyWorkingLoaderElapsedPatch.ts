import { Loader } from "@earendil-works/pi-tui";
import { createWorkingElapsedMessage } from "./working-loader/createWorkingElapsedMessage";
import { isWorkingLoaderMessage } from "./working-loader/isWorkingLoaderMessage";
import type { PatchableLoader } from "./working-loader/types";
import { clearWorkingLoaderStartedAt, getWorkingLoaderStartedAt } from "./working-loader/workingLoaderStartedAt";

let workingLoaderElapsedPatchApplied = false;

/**
 * Adds elapsed runtime to the main interactive working loader.
 */
export function applyWorkingLoaderElapsedPatch(): void {
  if (workingLoaderElapsedPatchApplied) {
    return;
  }

  const prototype = Loader.prototype as unknown as PatchableLoader;
  const originalUpdateDisplay = prototype.updateDisplay;

  prototype.updateDisplay = function updateDisplayWithElapsedTime(this: PatchableLoader): void {
    const message = this.message ?? "";
    if (!isWorkingLoaderMessage(message)) {
      clearWorkingLoaderStartedAt(this);
      originalUpdateDisplay.call(this);
      return;
    }

    const now = Date.now();
    const startedAt = getWorkingLoaderStartedAt(this, now);
    this.message = createWorkingElapsedMessage(message, now - startedAt);
    try {
      originalUpdateDisplay.call(this);
    } finally {
      this.message = message;
    }
  };

  workingLoaderElapsedPatchApplied = true;
}
