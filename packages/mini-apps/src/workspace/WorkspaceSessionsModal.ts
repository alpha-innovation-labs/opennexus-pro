import { type ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { SelectPreviewModal, sanitizePlainText } from "@nexus/tui-kit/modal/index.js";

/**
 * Session picker modal with list and details pane.
 */
export class WorkspaceSessionsModal extends SelectPreviewModal {
	private readonly detailsByPath: Map<string, string[]>;

	constructor(
		theme: ExtensionCommandContext["ui"]["theme"],
		items: AutocompleteItem[],
		detailsByPath: Map<string, string[]>,
		done: (sessionPath: string | undefined) => void,
	) {
		super(theme, (item) => done(item.value), () => done(undefined), undefined, {
			leftTitle: "Sessions",
			rightTitle: "Details",
			leftPaneRatio: 0.45,
			itemStyles: {
				description: (_item, selected, text, uiTheme) => selected ? uiTheme.fg("accent", text) : uiTheme.fg("muted", text),
			},
		});

		this.detailsByPath = detailsByPath;
		this.setOnSelectionChange((item) => {
			if (!item) {
				this.setRightLines(["No session selected"]);
				return;
			}
			this.setRightLines(this.detailsByPath.get(item.value) ?? ["No details available"]);
		});
		this.setItems(items);
		this.setRightLines(items[0] ? this.detailsByPath.get(items[0].value) ?? ["No details available"] : ["No sessions found"]);
	}
}

/**
 * Builds human-readable session detail lines for the preview pane.
 *
 * @param session Session metadata from Pi.
 * @param currentSessionPath Active session path.
 * @returns Preview lines.
 */
export function buildSessionDetailLines(
	session: {
		path: string;
		cwd: string;
		name?: string;
		firstMessage: string;
		messageCount: number;
		modified: Date;
		created: Date;
	},
	currentSessionPath: string | undefined,
): string[] {
	const title = (session.name || session.firstMessage || "Untitled session").trim();
	const preview = sanitizePlainText(session.firstMessage || "No messages yet");
	return [
		title,
		"",
		`messages: ${session.messageCount}`,
		`modified: ${session.modified.toLocaleString()}`,
		`created: ${session.created.toLocaleString()}`,
		`cwd: ${session.cwd || "(unknown)"}`,
		`path: ${session.path}`,
		currentSessionPath === session.path ? "status: current session" : "status: available",
		"",
		"Preview",
		preview,
	];
}
