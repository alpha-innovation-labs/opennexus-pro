import type { MemoryItem } from "./MemoryItem.js";

/** File-tree row shown by the memory modal. */
export type MemoryTreeItem = {
	kind: "directory" | "file";
	label: string;
	path: string;
	relativePath: string;
	depth: number;
	item?: MemoryItem;
};
