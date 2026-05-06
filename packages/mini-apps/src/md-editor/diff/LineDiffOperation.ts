export type LineDiffOperation =
	| { kind: "unchanged"; oldLine: string; newLine: string; currentLineNumber: number }
	| { kind: "added"; newLine: string; currentLineNumber: number }
	| { kind: "removed"; oldLine: string };
