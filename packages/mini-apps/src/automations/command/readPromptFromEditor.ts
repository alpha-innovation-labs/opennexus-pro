import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Opens the configured editor and returns edited prompt content.
 *
 * @param initialPrompt Initial prompt content.
 * @returns Edited prompt content.
 */
export function readPromptFromEditor(initialPrompt = ""): string {
	const editor = process.env.EDITOR || process.env.VISUAL;
	if (!editor) throw new Error("Set EDITOR or pass --prompt for automation prompt content");
	const filePath = join(mkdtempSync(join(tmpdir(), "nexus-automation-")), "prompt.md");
	writeFileSync(filePath, initialPrompt, "utf8");
	execFileSync(editor, [filePath], { stdio: "inherit" });
	return readFileSync(filePath, "utf8").trim();
}
