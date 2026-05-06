import type { MemoryItem } from "../types/MemoryItem.js";
import type { MemoryTreeItem } from "../types/MemoryTreeItem.js";

/**
 * Builds project, topic, and collapsible reference rows for the memory browser.
 *
 * @param items Markdown memory items.
 * @param expandedReferences Projects whose references folder is expanded.
 * @returns File tree rows.
 */
export function createMemoryFileTreeItems(items: MemoryItem[], expandedReferences = new Set<string>()): MemoryTreeItem[] {
	const byProject = groupItemsByProject(items);
	const rows: MemoryTreeItem[] = [];
	for (const [projectSlug, projectItems] of [...byProject.entries()].sort()) {
		rows.push({ kind: "directory", role: "project", label: projectSlug, path: projectSlug, relativePath: projectSlug, depth: 0, projectSlug });
		const topicItems = projectItems.filter((item) => !isReferenceItem(item));
		for (const item of topicItems.sort(compareItems)) rows.push(toTopicRow(projectSlug, item));
		const references = projectItems.filter(isReferenceItem).sort(compareItems);
		if (references.length === 0) continue;
		rows.push({ kind: "directory", role: "references", label: "references", path: `${projectSlug}/references`, relativePath: `${projectSlug}/references`, depth: 1, projectSlug });
		if (expandedReferences.has(projectSlug)) rows.push(...references.map((item) => toReferenceRow(projectSlug, item)));
	}
	return rows;
}

/** Groups memory items by project slug. */
function groupItemsByProject(items: MemoryItem[]): Map<string, MemoryItem[]> {
	const grouped = new Map<string, MemoryItem[]>();
	for (const item of items) {
		const projectSlug = item.relativePath.split("/")[0] ?? "global";
		grouped.set(projectSlug, [...(grouped.get(projectSlug) ?? []), item]);
	}
	return grouped;
}

/** Converts a topic markdown file into a tree row. */
function toTopicRow(projectSlug: string, item: MemoryItem): MemoryTreeItem {
	return { kind: "file", role: "topic", label: getFileLabel(item), path: item.path, relativePath: item.relativePath, depth: 1, projectSlug, item };
}

/** Converts a raw reference markdown file into a tree row. */
function toReferenceRow(projectSlug: string, item: MemoryItem): MemoryTreeItem {
	return { kind: "file", role: "reference", label: getFileLabel(item), path: item.path, relativePath: item.relativePath, depth: 2, projectSlug, item };
}

/** Returns whether an item belongs in the references folder. */
function isReferenceItem(item: MemoryItem): boolean {
	return item.relativePath.split("/")[1] === "references";
}

/** Gets a display label without markdown extension. */
function getFileLabel(item: MemoryItem): string {
	return item.relativePath.split("/").at(-1)?.replace(/\.md$/, "") ?? item.label;
}

/** Sorts memory files by relative path. */
function compareItems(left: MemoryItem, right: MemoryItem): number {
	return left.relativePath.localeCompare(right.relativePath);
}
