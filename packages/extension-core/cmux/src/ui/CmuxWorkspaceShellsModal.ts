import { SharedModal, type SharedModalTheme } from "@nexus/tui-kit/modal/index";

/**
 * Modal that displays cmux workspaces and shell/session mappings.
 */
export class CmuxWorkspaceShellsModal extends SharedModal {
	/**
	 * Creates the cmux workspace shell modal.
	 *
	 * @param theme Active UI theme.
	 * @param lines Workspace shell display lines.
	 * @param onClose Close callback.
	 */
	constructor(
		theme: SharedModalTheme,
		lines: string[],
		onClose: () => void,
		private readonly onSave: () => void,
		private readonly onLoad: () => void,
	) {
		super({
			footerLines: [theme.fg("dim", "s save · l load")],
			headerLines: [theme.fg("accent", "cmux workspaces")],
			maxWidth: 96,
			maxWidthRatio: 0.9,
			minWidth: 64,
			onClose,
			panes: [{ id: "cmux", lines, size: 1 }],
			theme,
		});
	}

	/**
	 * Handles save/load shortcuts for cmux session snapshots.
	 *
	 * @param data Raw keyboard input.
	 */
	override handleInput(data: string): void {
		if (data === "s") {
			this.onSave();
			return;
		}
		if (data === "l") {
			this.onLoad();
			return;
		}
		super.handleInput(data);
	}

	/**
	 * Replaces the modal body lines after async cmux loading completes.
	 *
	 * @param lines Workspace shell display lines.
	 */
	setLines(lines: string[]): void {
		this.panes = [{ id: "cmux", lines, size: 1 }];
	}
}
