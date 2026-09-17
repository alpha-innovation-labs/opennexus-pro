import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerChildTools } from "./tools/child-tools";

/**
 * The child-side extension entry.
 *
 * This module is loaded by the child (headless) pi process via the `--extension` flag
 * the parent's spawn puts on the child's argv. It registers the child's tools
 * (`done` and `ping`). It is a default export (a function taking the `ExtensionAPI`)
 * so the extension loader loads it the same way it loads the parent's extension.
 *
 * The child is a separate OS process reached only by its durable files and its exit,
 * so these tools act by writing durable state the parent's watcher reads. See the
 * tool-surface context for the protocol this half implements.
 *
 * Target: context/extension/subagents/tool-surface.md (the child tools).
 */
export default function registerSubagentsChildExtension(
	pi: ExtensionAPI,
): void {
	registerChildTools(pi);
}
