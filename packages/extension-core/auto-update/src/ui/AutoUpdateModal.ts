import { Key, matchesKey } from "@earendil-works/pi-tui";
import { SharedModal, type SharedModalTheme } from "@nexus/tui-kit";
import { createAutoUpdateModalLines } from "./createAutoUpdateModalLines";

export type AutoUpdateModalOptions = {
	currentVersion: string;
	latestVersion: string;
	onCancel: () => void;
	onConfirm: () => void;
	packageName: string;
	theme: SharedModalTheme;
};

/**
 * Modal component that asks whether Nexus should install an available update.
 */
export class AutoUpdateModal extends SharedModal {
	private readonly onConfirm: () => void;

	/**
	 * Creates the auto-update yes/no modal.
	 *
	 * @param options Modal callbacks, theme, and version display values.
	 */
	constructor(options: AutoUpdateModalOptions) {
		super({
			footerLines: [
				`${options.theme.fg("syntaxType", "Enter/y")}: ${options.theme.fg("text", "yes")} · ${options.theme.fg("error", "Esc/n")}: ${options.theme.fg("text", "no")}`,
			],
			headerLines: [options.theme.fg("accent", "Nexus update available")],
			maxWidthRatio: 0.72,
			minWidth: 56,
			onClose: options.onCancel,
			panes: createAutoUpdateModalLines(options),
			theme: options.theme,
		});
		this.onConfirm = options.onConfirm;
	}

	/**
	 * Handles yes/no modal shortcuts.
	 *
	 * @param data Raw keyboard input.
	 */
	override handleInput(data: string): void {
		if (matchesKey(data, Key.enter) || data.toLowerCase() === "y") {
			this.onConfirm();
			return;
		}
		if (data.toLowerCase() === "n") {
			super.handleInput("\x1b");
			return;
		}
		super.handleInput(data);
	}
}
