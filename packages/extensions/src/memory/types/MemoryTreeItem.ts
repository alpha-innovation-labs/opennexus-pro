import type { MemoryItem } from "./MemoryItem.js";

/** File-tree row shown by the memory modal. */
export type MemoryTreeItem = {
	kind: "directory" | "file";
	role: "project" | "references" | "reference" | "topic";
	label: string;
	path: string;
	relativePath: string;
	depth: number;
	projectSlug?: string;
	item?: MemoryItem;
};
