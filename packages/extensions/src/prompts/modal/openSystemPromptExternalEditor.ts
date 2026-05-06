import { spawnSync } from "node:child_process";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TUI } from "@mariozechner/pi-tui";

/**
 * Opens the configured external editor using Pi's extension-editor behavior.
 *
 * @param tui TUI instance to stop while the external editor owns the terminal.
 * @param prompt Current prompt content.
 * @returns Updated prompt when the editor exits successfully, otherwise undefined.
 */
export function openSystemPromptExternalEditor(
	tui: TUI,
	prompt: string,
): string | undefined {
	const editorCommand = process.env.VISUAL || process.env.EDITOR;
	if (!editorCommand) return undefined;

	const tmpFile = join(tmpdir(), `nexus-system-prompt-${Date.now()}.md`);
	try {
		writeFileSync(tmpFile, prompt, "utf-8");
		tui.stop();
		const [editor, ...editorArgs] = editorCommand.split(" ");
		const result = spawnSync(editor, [...editorArgs, tmpFile], {
			shell: process.platform === "win32",
			stdio: "inherit",
		});
		if (result.status !== 0) return undefined;
		return readFileSync(tmpFile, "utf-8").replace(/\n$/u, "");
	} finally {
		try {
			unlinkSync(tmpFile);
		} catch {
			// Ignore cleanup errors, matching Pi's extension editor behavior.
		}
		tui.start();
		tui.requestRender(true);
	}
}
