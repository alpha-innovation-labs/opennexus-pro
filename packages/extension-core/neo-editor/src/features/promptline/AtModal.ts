import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { AutocompleteItem } from "@earendil-works/pi-tui";
import type { ReferenceCompletionItem } from "@extensions/subagent-tintin/ui/reference-completion";
import {
	SelectPreviewModal,
	sanitizePlainText,
} from "@nexus/tui-kit/modal/index";

/**
 * Two-pane picker used for agent, file, and folder references.
 */
export class AtModal extends SelectPreviewModal {
	constructor(
		private readonly cwd: string,
		private readonly previewTheme: ExtensionContext["ui"]["theme"],
		onPick: (item: AutocompleteItem) => void,
		onClose: () => void,
		requestRender: () => void,
	) {
		super(previewTheme, onPick, onClose, undefined, {
			leftTitle: "Results",
			rightTitle: "Preview",
			bottomTitle: "References",
			bottomPrefix: "> @",
		});

		this.setOnSelectionChange((item) => {
			this.updatePreview(item, requestRender);
		});
	}

	/**
	 * Updates the query line shown in the bottom section.
	 *
	 * @param query Active autocomplete query.
	 */
	setQuery(query: string): void {
		this.setBottom("References", query, "> @");
	}

	/**
	 * Keeps compatibility with the prior editor API.
	 *
	 * @param _mode Autocomplete mode.
	 */
	setMode(_mode: "file"): void {}

	/**
	 * Refreshes the right-pane preview for the selected item.
	 *
	 * @param item Selected autocomplete item.
	 * @param requestRender Render callback.
	 */
	private updatePreview(
		item: ReferenceCompletionItem | null,
		requestRender: () => void,
	): void {
		// Synchronous replacement: no delayed file work can overwrite a new selection.
		if (item?.reference?.kind === "agent") {
			const agent = item.reference.agent;
			const lines = agent ? [
				`@${agent.handle}`,
				`Type: ${agent.typeLabel && agent.typeLabel !== agent.type ? `${agent.typeLabel} (${agent.type})` : agent.type}`,
				agent.description,
				`Action: ${agent.action}${agent.startType ? ` (${agent.startType})` : ""}`,
				agent.status && `Status: ${agent.status}`,
				agent.model && `Model: ${agent.model}`,
				agent.sessionFile && `Session: ${agent.sessionFile}`,
				agent.toolUses !== undefined ? `Tool uses: ${agent.toolUses}` : undefined,
			] : [item.value, "Agent information unavailable"];
			this.setRightLines(lines.filter((line): line is string => Boolean(line))
				.flatMap(line => line.split("\n"))
				.map(line => this.previewTheme.fg("muted", sanitizePlainText(line))));
			requestRender();
			return;
		}
		if (!item?.value) {
			this.setRightLines([this.previewTheme.fg("dim", "No preview")]);
			requestRender();
			return;
		}

		const path = resolve(this.cwd, item.value.replace(/^@/, ""));
		try {
			const content = readFileSync(path, "utf8");
			const rawLines = content.split("\n").slice(0, 16);
			const previewLines = rawLines.map((line) =>
				this.previewTheme.fg("muted", sanitizePlainText(line)),
			);
			if (content.split("\n").length > 16)
				previewLines.push(this.previewTheme.fg("dim", "…"));
			this.setRightLines(previewLines);
		} catch {
			this.setRightLines([
				this.previewTheme.fg("dim", item.value),
				this.previewTheme.fg("warning", "Preview unavailable"),
			]);
		}
		requestRender();
	}
}
