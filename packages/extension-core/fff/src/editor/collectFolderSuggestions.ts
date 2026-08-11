import type { FffFileCandidate } from "../shared/types";

/**
 * Collects unique folder suggestions from file candidates.
 *
 * @param candidates Ranked file candidates.
 * @param rawQuery Raw autocomplete query.
 * @returns Ranked folder paths.
 */
export function collectFolderSuggestions(
	candidates: FffFileCandidate[],
	rawQuery: string,
): string[] {
	const normalizedQuery = rawQuery
		.replace(/^\.?\//, "")
		.replace(/\\/g, "/")
		.toLowerCase();
	const folders: string[] = [];
	const seen = new Set<string>();

	for (const candidate of candidates) {
		const parts = candidate.item.relativePath.split("/");
		if (parts.length < 2) continue;

		for (let index = 1; index < parts.length; index += 1) {
			const folderPath = parts.slice(0, index).join("/");
			if (!folderPath || seen.has(folderPath)) continue;
			const normalizedFolderPath = folderPath.toLowerCase();
			const folderName = parts[index - 1]?.toLowerCase() ?? "";
			if (
				normalizedQuery &&
				!normalizedFolderPath.includes(normalizedQuery) &&
				!folderName.includes(normalizedQuery)
			) {
				continue;
			}
			seen.add(folderPath);
			folders.push(folderPath);
		}
	}

	folders.sort(
		(left, right) => left.length - right.length || left.localeCompare(right),
	);
	return folders;
}
