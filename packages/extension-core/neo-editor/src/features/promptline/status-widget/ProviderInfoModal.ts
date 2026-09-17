import { Key, matchesKey, truncateToWidth } from "@earendil-works/pi-tui";
import {
	computeModalWidth,
	type SelectPreviewTheme,
	SharedModal,
} from "@nexus/tui-kit/modal/index";

/**
 * Modal that shows the active provider, model, and thinking level.
 */
export class ProviderInfoModal extends SharedModal {
	focused = true;

	constructor(
		private readonly uiTheme: SelectPreviewTheme,
		private readonly provider: string,
		private readonly modelId: string,
		private readonly thinking: string,
		private readonly closeModal: () => void,
	) {
		super({
			theme: uiTheme,
			minWidth: 48,
			maxWidthRatio: 0.6,
			onClose: closeModal,
			headerLines: [uiTheme.fg("accent", "● Provider")],
			panes: [],
		});
	}

	handleInput(data: string): void {
		if (
			matchesKey(data, Key.escape) ||
			matchesKey(data, Key.ctrl("c")) ||
			data === "q" ||
			matchesKey(data, Key.enter)
		) {
			this.closeModal();
			return;
		}
		super.handleInput(data);
	}

	render(width: number): string[] {
		const dialogWidth = Math.max(1, computeModalWidth(width, 48, 0.6) - 2);
		const rows = [
			`${this.uiTheme.fg("muted", "Provider:")} ${this.uiTheme.fg(
				"accent",
				truncateToWidth(this.provider, dialogWidth - 11, "…"),
			)}`,
			`${this.uiTheme.fg("muted", "Model:")} ${truncateToWidth(this.modelId, dialogWidth - 8, "…")}`,
			`${this.uiTheme.fg("muted", "Thinking:")} ${truncateToWidth(this.thinking, dialogWidth - 11, "…")}`,
		];
		this.footerHotkeys = [
			{ key: "Esc/Ctrl+C/q", label: "closes" },
		];
		this.footerLines = [];
		this.panes = [
			{
				id: "provider-info",
				size: 1,
				lines: rows,
			},
		];
		return super.render(width);
	}
}
