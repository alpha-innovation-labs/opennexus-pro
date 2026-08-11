import {
	SelectPreviewModal,
	type SelectPreviewTheme,
} from "@nexus/tui-kit/modal/index";
import { createCmuxSavedSessionItems } from "../snapshots/createCmuxSavedSessionItems";
import type { CmuxSavedSession } from "../snapshots/types";

/**
 * Two-pane modal for browsing saved cmux session snapshots.
 */
export class CmuxSavedSessionsModal extends SelectPreviewModal {
	private sessions: CmuxSavedSession[];

	/**
	 * Creates the saved cmux sessions modal.
	 *
	 * @param theme Active UI theme.
	 * @param sessions Saved cmux sessions.
	 * @param onClose Close callback.
	 * @param onDelete Delete callback.
	 * @param onRenderNeeded Render request callback.
	 */
	constructor(
		theme: SelectPreviewTheme,
		sessions: CmuxSavedSession[],
		onClose: () => void,
		private readonly onDelete: (sessionId: string) => void,
		private readonly onRenderNeeded: () => void,
	) {
		super(theme, () => undefined, onClose, undefined, {
			leftTitle: "Saved sessions",
			rightTitle: "Workspaces / panes",
			bottomTitle: "Load",
			bottomPrefix: "Enter ",
			minWidth: 84,
			maxWidth: 110,
			maxWidthRatio: 0.92,
		});
		this.sessions = sessions;
		this.setOnSelectionChange((item) => this.showPreview(item?.value));
		this.setItems(createCmuxSavedSessionItems(sessions));
		this.setFooterHintLines([
			theme.fg("dim", "Enter selects · d delete · Esc closes"),
		]);
		this.showPreview(sessions[0]?.id);
	}

	/**
	 * Handles saved-session deletion.
	 *
	 * @param data Raw keyboard input.
	 */
	override handleInput(data: string): void {
		if (data === "d") {
			this.deleteSelectedSession();
			return;
		}
		super.handleInput(data);
	}

	/**
	 * Deletes the currently selected saved session.
	 */
	private deleteSelectedSession(): void {
		const selected = this.getSelectedItem();
		if (!selected) return;
		this.sessions = this.sessions.filter(
			(session) => session.id !== selected.value,
		);
		this.onDelete(selected.value);
		this.setItems(createCmuxSavedSessionItems(this.sessions));
		this.showPreview(this.sessions[0]?.id);
		this.onRenderNeeded();
	}

	/**
	 * Shows the selected saved session in the right preview pane.
	 *
	 * @param sessionId Saved session id.
	 */
	private showPreview(sessionId: string | undefined): void {
		const session = this.sessions.find((entry) => entry.id === sessionId);
		this.setRightLines(session?.lines ?? ["No saved cmux sessions yet."]);
	}
}
