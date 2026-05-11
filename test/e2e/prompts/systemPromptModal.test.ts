import assert from "node:assert/strict";
import test from "node:test";
import { extractAppendSection } from "../../../packages/extension-core/src/prompts/modal/append-section/extractAppendSection.js";
import { replaceAppendSection } from "../../../packages/extension-core/src/prompts/modal/append-section/replaceAppendSection.js";
import type { SystemPromptModalAction } from "../../../packages/extension-core/src/prompts/modal/types.js";
import { SystemPromptModal } from "../../../packages/extension-core/src/prompts/modal/SystemPromptModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates a system prompt modal fixed to a deterministic test row count.
 *
 * @param prompt Prompt content to render.
 * @param done Action callback.
 * @returns Test modal instance.
 */
function createModal(
	prompt: string,
	done: (action: SystemPromptModalAction) => void = () => {},
	rowCount = 20,
): SystemPromptModal {
	return new SystemPromptModal(
		createTestTheme(),
		prompt,
		false,
		done,
		undefined,
		() => {},
		() => rowCount,
	);
}

test("/SystemPrompt modal renders fullscreen prompt controls", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => createModal("You are Nexus.\nFollow project rules."),
		120,
		24,
	);
	const output = viewport.join("\n");

	assert.match(output, /● System Prompt/u);
	assert.doesNotMatch(output, /System Prompt \(default\)/u);
	assert.match(output, /System Prompt/u);
	assert.match(output, /Tools/u);
	assert.match(output, /You are Nexus\./u);
	assert.match(output, /Follow project rules\./u);
	assert.match(output, /Tab\/h\/l focus · j\/k move\/scroll/u);
	assert.doesNotMatch(output, /r reset/u);
	assert.doesNotMatch(output, /e edit/u);
	assert.equal(viewport[0]?.length, 120);
});

test("/SystemPrompt modal does not advertise reset hotkey", () => {
	const output = createModal("Prompt").render(80).join("\n");

	assert.doesNotMatch(output, /r reset/u);
});

test("/SystemPrompt left-pane highlighted item is teal", () => {
	const modal = new SystemPromptModal(
		createTestTheme(),
		["Available tools:", "- read: Read files", "", "Guidelines:", "Be precise."].join("\n"),
		false,
		() => {},
		undefined,
		() => {},
		() => 20,
	);
	modal.render(120);
	modal.handleInput("j");
	const output = modal.render(120).join("\n");

	assert.match(output, /\x1b\[38;2;45;212;191m.*Guidelines/u);
});

test("/SystemPrompt Tools selection shows native tool params in wterm", async () => {
	const modal = createModal(["Available tools:", "- read: Read files"].join("\n"));
	modal.render(120);
	modal.handleInput("j");
	const viewport = await renderComponentInVirtualTerminal(() => modal, 120, 24);
	const output = viewport.join("\n");

	assert.match(output, /① read/u);
	assert.match(output, /Params/u);
	assert.match(output, /path: string/u);
	assert.match(output, /offset\?: number/u);
});

test("/SystemPrompt right pane does not overflow past the modal border in wterm", async () => {
	const prompt = [
		"Available tools:",
		"- annotate: Use only when the user explicitly asks for annotation with a very long description that must wrap safely",
		"- context_usage: Inspect the current context usage with enough detail to wrap safely",
		"- ask_user_question: Ask the user up to four structured questions when needed",
		"- todo: Manage a task list to track multi-step progress",
		"",
		"Guidelines:",
		"In addition to the tools above, you may have access to other custom tools depending on the project.",
	].join("\n");
	const viewport = await renderComponentInVirtualTerminal(() => createModal(prompt), 120, 24);

	assert.equal(viewport.every((line) => line.length <= 120), true);
	assert.equal(viewport.some((line) => /│.*│.*[{}]$/u.test(line)), false);
});

test("/SystemPrompt modal renders markdown in the right pane in wterm", async () => {
	const prompt = [
		"You are an expert coding assistant.",
		"",
		"Available tools:",
		"- read: Read files",
		"- write: Write files",
		"",
		"Guidelines:",
		"Use **bold** guidance and `code` examples.",
	].join("\n");
	const directOutput = createModal(prompt).render(120).join("\n");
	const viewport = await renderComponentInVirtualTerminal(() => createModal(prompt), 120, 24);
	const output = viewport.join("\n");

	assert.match(output, /● read: Read files/u);
	assert.match(directOutput, /\x1b\[[0-9;:]*m● \x1b\[0mread: Read files/u);
	assert.match(output, /● write: Write files/u);
	assert.match(output, /Available tools:/u);
});

test("/SystemPrompt modal renders prompt sections and tools in the left pane", async () => {
	const prompt = [
		"You are an expert coding assistant.",
		"",
		"Available tools:",
		"- read: Read files",
		"- write: Write files",
		"",
		"Guidelines:",
		"- Be concise",
		"",
		"You are Nexus append block.",
		"",
		"# AGENTS.md",
		"Project instructions",
		"",
		"<available_skills>",
		"</available_skills>",
	].join("\n");
	const viewport = await renderComponentInVirtualTerminal(() => createModal(prompt, () => {}, 24), 120, 24);
	const output = viewport.join("\n");

	assert.match(output, /User Prompt/u);
	assert.match(output, /├─ Content/u);
	assert.match(output, /└─ AGENTS\.md/u);
	assert.match(output, /System Prompt/u);
	assert.doesNotMatch(output, /› System Prompt/u);
	assert.match(output, /├─ Available tools/u);
	assert.doesNotMatch(output, /├─ Context/u);
	assert.match(output, /└─ Skills/u);
	assert.match(output, /Tools/u);
	assert.match(output, /├─ read/u);
	assert.match(output, /├─ grep/u);
	assert.match(output, /└─ ls/u);
	assert.doesNotMatch(output, /› Tools/u);
});

test("/SystemPrompt appendSection helpers only replace the append block", () => {
	const prompt = ["Base", "", "You are Nexus old.", "", "# AGENTS.md", "AGENTS"].join("\n");

	assert.equal(extractAppendSection(prompt), "You are Nexus old.");
	assert.equal(replaceAppendSection(prompt, "You are Nexus new."), ["Base", "", "You are Nexus new.", "# AGENTS.md", "AGENTS"].join("\n"));
});

test("/SystemPrompt modal shows edit hotkey only for user prompt content", () => {
	const prompt = ["Available tools:", "- read: Read files", "", "You are Nexus custom."].join("\n");
	const modal = createModal(prompt, () => {}, 12);

	assert.match(modal.render(80).join("\n"), /e edit/u);
	modal.handleInput("j");
	assert.doesNotMatch(modal.render(80).join("\n"), /e edit/u);
});

test("/SystemPrompt modal supports vim-style prompt scrolling", () => {
	const prompt = Array.from(
		{ length: 20 },
		(_, index) => `line-${index + 1}`,
	).join("\n");
	const modal = createModal(prompt, () => {}, 12);

	assert.match(modal.render(80).join("\n"), /line-1/u);
	modal.handleInput("\t");
	modal.handleInput("j");
	assert.doesNotMatch(modal.render(80).join("\n"), /line-1/u);
	modal.handleInput("G");
	assert.match(modal.render(80).join("\n"), /line-(19|20)/u);
	modal.handleInput("g");
	modal.handleInput("g");
	assert.match(modal.render(80).join("\n"), /line-1/u);
});

test("/SystemPrompt modal supports h and l focus movement", () => {
	const modal = createModal(["Available tools:", "- read: Read files"].join("\n"), () => {}, 12);

	assert.match(modal.render(80).join("\n"), /Tab\/h\/l focus/u);
	modal.handleInput("l");
	assert.match(modal.render(80).join("\n"), /Available tools:.*┃/su);
	modal.handleInput("h");
	assert.match(modal.render(80).join("\n"), /Available tools.*┃/su);
});

test("/SystemPrompt modal supports arrow-key left-pane movement without hotkey text", () => {
	const prompt = ["Available tools:", "- read: Read files", "", "Guidelines:", "Be direct."].join("\n");
	const modal = createModal(prompt, () => {}, 12);

	assert.doesNotMatch(modal.render(80).join("\n"), /arrow|up|down/i);
	modal.handleInput("\x1b[B");
	assert.match(modal.render(80).join("\n"), /\x1b\[38;2;45;212;191m.*Guidelines/u);
	modal.handleInput("\x1b[A");
	assert.match(modal.render(80).join("\n"), /\x1b\[38;2;45;212;191m.*Available tool/u);
});
