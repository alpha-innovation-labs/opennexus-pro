import { resolve } from "node:path";
import { formatResumeAge } from "./formatResumeAge";
import { formatResumeSummary } from "./formatResumeSummary";
import { readResumeSessionStats } from "./readResumeSessionStats";
import { readResumeTaskDescriptions } from "./readResumeTaskDescriptions";
import type { ResumeSessionInfo } from "./resume-scope/listResumeSessions";
import type { SlashMenuLeaf } from "./types";

/** Build a threaded list, ordered by the newest activity in each subtree. */
export function createResumeLeaves(sessions: ResumeSessionInfo[]): SlashMenuLeaf[] {
	type Node = { session: ResumeSessionInfo; children: Node[]; latest: number };
	const nodes = new Map<string, Node>();
	for (const session of sessions) {
		nodes.set(resolve(session.path), { session, children: [], latest: session.modified.getTime() });
	}
	const roots: Node[] = [];
	for (const node of nodes.values()) {
		const parent = node.session.parentSessionPath;
		let ancestor = parent ? nodes.get(resolve(parent)) : undefined;
		const seen = new Set<Node>([node]);
		let cyclic = false;
		while (ancestor) {
			if (seen.has(ancestor)) { cyclic = true; break; }
			seen.add(ancestor);
			const path = ancestor.session.parentSessionPath;
			ancestor = path ? nodes.get(resolve(path)) : undefined;
		}
		const parentNode = parent ? nodes.get(resolve(parent)) : undefined;
		if (parentNode && !cyclic) parentNode.children.push(node);
		else roots.push(node);
	}
	const sort = (items: Node[]): void => {
		for (const node of items) {
			sort(node.children);
			for (const child of node.children) node.latest = Math.max(node.latest, child.latest);
		}
		items.sort((a, b) => b.latest - a.latest);
	};
	sort(roots);
	const leaves: SlashMenuLeaf[] = [];
	const taskDescriptions = new Map<string, Map<string, string>>();
	const taskTitle = (session: ResumeSessionInfo): string | undefined => {
		const idPrefix = session.name?.match(/#([a-zA-Z0-9_-]{8})$/)?.[1];
		if (!idPrefix || !session.parentSessionPath) return undefined;
		const parentPath = resolve(session.parentSessionPath);
		let descriptions = taskDescriptions.get(parentPath);
		if (!descriptions) {
			descriptions = readResumeTaskDescriptions(parentPath);
			taskDescriptions.set(parentPath, descriptions);
		}
		const matches = [...descriptions].filter(([id]) => id.startsWith(idPrefix));
		return matches.length === 1 ? matches[0][1] : undefined;
	};
	const walk = (node: Node, prefix: string, branch: string): void => {
		const session = node.session;
		const description = taskTitle(session);
		const agentName = description ? session.name?.replace(/#[a-zA-Z0-9_-]{8}$/, "").trim() : undefined;
		leaves.push({
			kind: "session",
			label: description ? `${agentName} · ${description}` : session.name?.trim() || session.firstMessage?.trim() || session.path.split("/").pop() || session.path,
			resumeAgentName: agentName,
			resumeChild: !!session.parentSessionPath,
			description: formatResumeSummary(readResumeSessionStats(session.path)),
			value: session.path,
			resumeAge: formatResumeAge(session.modified.getTime()),
			resumeTreePrefix: prefix + branch,
		});
		node.children.forEach((child, index) => {
			walk(
				child,
				prefix + (branch === "├─ " ? "│  " : branch ? "   " : "  "),
				index === node.children.length - 1 ? "└─ " : "├─ ",
			);
		});
	};
	for (const root of roots) walk(root, "", "");
	return leaves;
}
