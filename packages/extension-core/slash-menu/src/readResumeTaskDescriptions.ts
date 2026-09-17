import { readFileSync } from "node:fs";

/** Read task titles already recorded by Tintin in the spawning session. */
export function readResumeTaskDescriptions(parentPath: string): Map<string, string> {
	const descriptions = new Map<string, string>();
	let content: string;
	try { content = readFileSync(parentPath, "utf8"); }
	catch { return descriptions; }
	for (const line of content.split("\n")) {
		try {
			const entry = JSON.parse(line);
			const data = entry.type === "custom" && entry.customType === "subagents:record"
				? entry.data
				: entry.type === "message" && entry.message?.role === "toolResult" && entry.message?.toolName === "Agent"
					? entry.message.details : undefined;
			const id = data?.id ?? data?.agentId;
			if (typeof id === "string" && typeof data?.description === "string" && data.description.trim())
				descriptions.set(id, data.description.trim());
		} catch { /* A partial trailing line must not break the resume menu. */ }
	}
	return descriptions;
}
