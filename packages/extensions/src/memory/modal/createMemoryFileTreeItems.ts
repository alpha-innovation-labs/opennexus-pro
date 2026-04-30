import type { MemoryItem } from "../types/MemoryItem.js";
import type { MemoryTreeItem } from "../types/MemoryTreeItem.js";

/**
 * Builds file-only tree rows for the memory browser.
 *
 * @param items Markdown memory items.
 * @returns File rows in path order.
 */
export function createMemoryFileTreeItems(items: MemoryItem[]): MemoryTreeItem[] {
	return [...items].sort(compareMemoryFiles).map((item) => {
		const parts = item.relativePath.split("/");
		return {
			kind: "file",
			label: getFileTreeLabel(parts, item.label),
			path: item.path,
			relativePath: item.relativePath,
			depth: getFileTreeDepth(parts),
			item,
		};
	});
}

/** Sorts project root index files before nested project files. */
function compareMemoryFiles(left: MemoryItem, right: MemoryItem): number {
	const leftParts = left.relativePath.split("/");
	const rightParts = right.relativePath.split("/");
	const projectCompare = (leftParts[0] ?? "").localeCompare(rightParts[0] ?? "");
	if (projectCompare !== 0) return projectCompare;
	const rootCompare = Number(!isProjectRootIndex(leftParts)) - Number(!isProjectRootIndex(rightParts));
	if (rootCompare !== 0) return rootCompare;
	const referenceCompare = Number(!isReferenceIndex(leftParts)) - Number(!isReferenceIndex(rightParts));
	return referenceCompare !== 0 ? referenceCompare : left.relativePath.localeCompare(right.relativePath);
}

/** Returns whether a markdown file is the project root index. */
function isProjectRootIndex(parts: string[]): boolean {
	return parts.length === 2 && parts[1] === `${parts[0]}.md`;
}

/** Gets display depth while keeping project root files at depth zero. */
function getFileTreeDepth(parts: string[]): number {
	if (isProjectRootIndex(parts)) return 0;
	return isReferenceFile(parts) && !isReferenceIndex(parts) ? 2 : 1;
}

/** Gets display label while naming the reference index as references. */
function getFileTreeLabel(parts: string[], fallback: string): string {
	return isReferenceIndex(parts) ? "references" : parts.at(-1)?.replace(/\.md$/, "") ?? fallback;
}

/** Returns whether a file is the reference index. */
function isReferenceIndex(parts: string[]): boolean {
	return parts.at(-2) === "reference" && parts.at(-1) === "references.md";
}

/** Returns whether a file belongs to a reference subtree. */
function isReferenceFile(parts: string[]): boolean {
	return parts.includes("reference");
}
