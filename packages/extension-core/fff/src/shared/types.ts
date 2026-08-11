import type { GrepCursor, GrepMatch, Location, Score } from "@ff-labs/fff-node";

export type FffFeatureKey =
	| "editorAutocomplete"
	| "readOverride"
	| "grepOverride";

export type FffFileCandidate = {
	item: {
		path?: string;
		relativePath: string;
		fileName?: string;
		totalFrecencyScore: number;
		gitStatus: string;
	};
	score?: Score;
};

export type ResolvedPath = {
	query: string;
	absolutePath: string;
	relativePath: string;
	pathType: "file" | "directory";
	location?: Location;
	candidates: FffFileCandidate[];
};

export type GrepSearchResponse = {
	items: GrepMatch[];
	formatted: string;
	nextCursor?: string;
	scope?: ResolvedPath;
	constraintQuery?: string;
};

export type StoredGrepContinuation = {
	requestKey: string;
	remainingItems: GrepMatch[];
	engineCursor: GrepCursor | null;
};
