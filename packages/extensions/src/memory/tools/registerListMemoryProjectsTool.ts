import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { resolveMemoryRoot } from "../settings/resolveMemoryRoot.js";
import { listMemoryProjects } from "../storage/listMemoryProjects.js";

/**
 * Registers the tool that lists available memory projects.
 *
 * @param pi Extension API.
 */
export function registerListMemoryProjectsTool(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "memory_list_projects",
		skipLeadingSpacer: true,
		label: "List Memory Projects",
		description: "List existing global Nexus memory projects before storing knowledge.",
		promptSnippet: "List Nexus memory projects to choose a confirmed project target before storing memory",
		parameters: Type.Object({}),
		async execute() {
			const projects = await listMemoryProjects(await resolveMemoryRoot());
			const text = projects.length === 0 ? "No Nexus memory projects exist yet." : projects.map((project) => `- ${project.slug}: ${project.path}`).join("\n");
			return { content: [{ type: "text", text }], details: { projects } };
		},
	});
}
