import { Loader } from "@earendil-works/pi-tui";
import { createWorkingElapsedMessage } from "./working-loader/createWorkingElapsedMessage";
import { isWorkingLoaderMessage } from "./working-loader/isWorkingLoaderMessage";
import type { PatchableLoader } from "./working-loader/types";
import {
	clearWorkingLoaderStartedAt,
	getWorkingLoaderStartedAt,
} from "./working-loader/workingLoaderStartedAt";

let workingLoaderElapsedPatchApplied = false;

/**
 * Adds elapsed runtime to the main interactive working loader.
 */
export function applyWorkingLoaderElapsedPatch(): void {
	if (workingLoaderElapsedPatchApplied) {
		return;
	}

	const prototype = Loader.prototype as unknown as {
		message?: string;
		updateDisplay(): void;
	};

	const originalUpdateDisplay = prototype.updateDisplay.bind(prototype);

	prototype.updateDisplay = function updateDisplayWithElapsedTime(): void {
		const message = (this as { message?: string }).message ?? "";
		if (!isWorkingLoaderMessage(message)) {
			clearWorkingLoaderStartedAt(this as PatchableLoader);
			originalUpdateDisplay();
			return;
		}

		const now = Date.now();
		const startedAt = getWorkingLoaderStartedAt(this as PatchableLoader, now);
		(this as { message?: string }).message = createWorkingElapsedMessage(
			message,
			now - startedAt,
		);
		try {
			originalUpdateDisplay();
		} finally {
			(this as { message?: string }).message = message;
		}
	};

	workingLoaderElapsedPatchApplied = true;
}
