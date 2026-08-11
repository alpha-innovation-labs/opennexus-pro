import type { DeleteSessionMatch } from "./DeleteSessionMatch";

export type DeleteSessionResolveResult =
	| { type: "found"; session: DeleteSessionMatch }
	| { type: "not_found"; sessionReference: string }
	| {
			type: "ambiguous";
			sessionReference: string;
			matches: DeleteSessionMatch[];
	  };
