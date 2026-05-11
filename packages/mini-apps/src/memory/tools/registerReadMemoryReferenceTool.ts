import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { resolveMemoryRoot } from "../settings/resolveMemoryRoot.js";
import { readMemoryReference } from "../storage/readMemoryReference.js";

/**
 * Registers a targeted raw reference reader for memory query follow-up.
 *
 * @param pi Extension API.
 */
export function registerReadMemoryReferenceTool(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "memory_read_reference",
		label: "Read Memory Reference",
		description: "Read one raw Nexus memory reference by project and reference name after memory_query finds it.",
		promptSnippet: "Use memory_read_reference only when raw source details are needed after memory_query",
		parameters: Type.Object({ projectName: Type.String(), referenceName: Type.String() }),
		async execute(_toolCallId, params) {
			const text = await readMemoryReference(await resolveMemoryRoot(), params.projectName, params.referenceName);
			return { content: [{ type: "text", text }], details: { projectName: params.projectName, referenceName: params.referenceName } };
		},
	});
}
