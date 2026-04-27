export type MarkdownDiffRow = {
	kind: "unchanged" | "added" | "removed" | "changed";
	text: string;
	currentLineNumber?: number;
};
