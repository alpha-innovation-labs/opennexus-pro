import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { loadDemoMarkdownFile } from "../file/loadDemoMarkdownFile.js";
import { watchMarkdownFile } from "../file/watchMarkdownFile.js";
import { listLineChatSessions } from "../line-chat/listLineChatSessions.js";
import { markLineChatSessionObsolete } from "../line-chat/markLineChatSessionObsolete.js";
import { reconcileLineChatSessions } from "../line-chat/reconcileLineChatSessions.js";
import { createMdEditorInitialState } from "./createMdEditorInitialState.js";
import { MdEditorModal } from "./MdEditorModal.js";

/**
 * Opens the md-editor overlay for the hardcoded demo.md file.
 */
export async function showMdEditorModal(ctx: ExtensionCommandContext): Promise<void> {
	if (!ctx.hasUI) return;
	let snapshot = await loadDemoMarkdownFile({ cwd: ctx.cwd });
	const allSessions = await listLineChatSessions(ctx.sessionManager.getSessionDir());
	const relevant = allSessions.filter((session) => session.metadata.filePath === snapshot.filePath);
	const reconciled = reconcileLineChatSessions(snapshot.lines, relevant.map((session) => session.metadata));
	for (const obsolete of reconciled.obsolete) {
		const session = relevant.find((item) => item.sessionId.includes(`line-${obsolete.lineNumber}`));
		if (session) await markLineChatSessionObsolete(ctx.sessionManager.getSessionDir(), session);
	}
	const sessions = new Map(relevant.filter((session) => session.metadata.status === "active").map((session) => [session.metadata.lineNumber, session]));
	const initial = await createMdEditorInitialState(ctx.sessionManager.getSessionDir());
	let modal: MdEditorModal | undefined;
	let watcher: ReturnType<typeof watchMarkdownFile> | undefined;
	await ctx.ui.custom<void>(
		(tui, _theme, _keybindings, done) => {
			modal = new MdEditorModal(ctx, snapshot, sessions, done, () => tui.requestRender(), initial);
			watcher = watchMarkdownFile(snapshot.filePath, (next) => {
				snapshot = next;
				modal?.setSnapshot(next);
			});
			return modal;
		},
		{ overlay: true, overlayOptions: { anchor: "center", width: "100%", minWidth: 80, maxHeight: "100%", margin: 0 } },
	);
	watcher?.close();
}
