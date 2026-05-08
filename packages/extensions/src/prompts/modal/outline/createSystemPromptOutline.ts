import { createPromptSectionChild } from "./createPromptSectionChild.js";
import { createToolOutlineChildren } from "./createToolOutlineChildren.js";
import { findPromptLineIndex } from "./findPromptLineIndex.js";
import type { SystemPromptOutline } from "./types.js";

/**
 * Creates the left-pane outline for the effective system prompt.
 *
 * @param prompt Effective system prompt text.
 * @returns System prompt outline sections.
 */
export function createSystemPromptOutline(prompt: string): SystemPromptOutline {
	const lines = prompt.split("\n");
	const availableToolsIndex = findPromptLineIndex(lines, (line) => line.trim() === "Available tools:");
	const guidelinesIndex = findPromptLineIndex(lines, (line) => line.trim() === "Guidelines:");
	const docsIndex = findPromptLineIndex(lines, (line) => line.startsWith("Pi documentation"));
	const appendIndex = findPromptLineIndex(lines, (line) => line.startsWith("You are Nexus "));
	const contextIndex = findPromptLineIndex(lines, (line) => line.trim() === "# Project Context");
	const skillsIndex = findPromptLineIndex(lines, (line) => line.trim() === "<available_skills>");
	const systemChildren = [
		createPromptSectionChild("Available tools", availableToolsIndex),
		createPromptSectionChild("Guidelines", guidelinesIndex),
		createPromptSectionChild("Pi docs", docsIndex),
		createPromptSectionChild("appendSection", appendIndex),
		createPromptSectionChild("Context", contextIndex),
		createPromptSectionChild("Skills", skillsIndex),
	].filter((child) => child !== undefined);
	return {
		sections: [
			{ label: "System Prompt", lineIndex: 0, children: systemChildren },
			{ label: "Tools", lineIndex: availableToolsIndex >= 0 ? availableToolsIndex : 0, children: createToolOutlineChildren(lines) },
		],
	};
}
