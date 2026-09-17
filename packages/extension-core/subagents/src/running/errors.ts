/**
 * Errors the running registry raises.
 *
 * The id is the stable handle; the name is convenience. Lookup is exact id
 * first, then name, and a name that matches more than one run is an error
 * that names the ambiguity and points the caller at the id.
 */

/**
 * Thrown when a run id or name resolves to no run.
 */
export class RunNotFoundError extends Error {
	/** The id or name that was looked up. */
	readonly query: string;

	constructor(query: string) {
		super(`No subagent run found for "${query}".`);
		this.name = "RunNotFoundError";
		this.query = query;
	}
}

/**
 * Thrown when a display name matches more than one run.
 *
 * The error names the ambiguity and points the caller at the matching ids so
 * the caller can disambiguate by exact id.
 */
export class AmbiguousRunNameError extends Error {
	/** The display name that matched more than one run. */
	readonly runName: string;
	/** The ids of every run the name matched. */
	readonly matchingIds: string[];

	constructor(runName: string, matchingIds: readonly string[]) {
		const idList = matchingIds.map((id) => `"${id}"`).join(", ");
		super(
			`Subagent run name "${runName}" is ambiguous: it matches ` +
				`${matchingIds.length} runs (${idList}). Use the run id to disambiguate.`,
		);
		this.name = "AmbiguousRunNameError";
		this.runName = runName;
		this.matchingIds = [...matchingIds];
	}
}

/**
 * Thrown when a run id is registered while it is already present.
 *
 * The id must stay unique across live and completed runs so an id always
 * points at exactly one run.
 */
export class DuplicateRunIdError extends Error {
	/** The run id that is already registered. */
	readonly id: string;

	constructor(id: string) {
		super(`A subagent run with id "${id}" is already registered.`);
		this.name = "DuplicateRunIdError";
		this.id = id;
	}
}
