import type { AutocompleteProvider } from "@earendil-works/pi-tui";
import type { FffRuntime } from "../runtime/FffRuntime";
import { collectFolderSuggestions } from "./collectFolderSuggestions";
import { createFolderAutocompleteItems } from "./createFolderAutocompleteItems";
import { extractAtPrefix } from "./extractAtPrefix";
import { normalizeInsertedPath } from "./normalizeInsertedPath";
import { parseAtPrefix } from "./parseAtPrefix";
import { toAutocompleteItem } from "./toAutocompleteItem";

const MAX_RESULTS = 20;

/**
 * Wraps an editor autocomplete provider with FFF-backed `@` file suggestions.
 *
 * @param baseProvider Existing editor autocomplete provider.
 * @param runtime Active FFF runtime.
 * @returns Wrapped autocomplete provider.
 */
export function createFffAutocompleteProvider(
	baseProvider: AutocompleteProvider,
	runtime: FffRuntime,
): AutocompleteProvider {
	return {
		async getSuggestions(lines, cursorLine, cursorCol, options) {
			const currentLine = lines[cursorLine] ?? "";
			const prefix = extractAtPrefix(currentLine.slice(0, cursorCol));
			if (!prefix) {
				return baseProvider.getSuggestions(
					lines,
					cursorLine,
					cursorCol,
					options,
				);
			}
			if (options.signal.aborted) return null;

			const parsed = parseAtPrefix(prefix);
			const candidates = await runtime
				.searchFileCandidates(parsed.rawQuery, MAX_RESULTS)
				.catch(() => null);
			if (options.signal.aborted || !candidates || candidates.length === 0) {
				return baseProvider.getSuggestions(
					lines,
					cursorLine,
					cursorCol,
					options,
				);
			}

			const folderItems = createFolderAutocompleteItems(
				collectFolderSuggestions(candidates, parsed.rawQuery).slice(
					0,
					MAX_RESULTS,
				),
				parsed.isQuotedPrefix,
			);
			const fileItems = candidates.map((candidate) => {
				const matchType = candidate.score?.matchType
					? ` · ${candidate.score.matchType}`
					: "";
				return toAutocompleteItem(
					candidate.item.relativePath,
					candidate.item.fileName || candidate.item.relativePath,
					`${candidate.item.relativePath}${matchType}`,
					parsed.isQuotedPrefix,
				);
			});

			return {
				prefix,
				items: [...folderItems, ...fileItems].slice(0, MAX_RESULTS),
			};
		},
		applyCompletion(lines, cursorLine, cursorCol, item, prefix) {
			void runtime
				.trackQuery(prefix, normalizeInsertedPath(item.value))
				.catch(() => undefined);
			return baseProvider.applyCompletion(
				lines,
				cursorLine,
				cursorCol,
				item,
				prefix,
			);
		},
		shouldTriggerFileCompletion(lines, cursorLine, cursorCol) {
			return (
				baseProvider.shouldTriggerFileCompletion?.(
					lines,
					cursorLine,
					cursorCol,
				) ?? true
			);
		},
	};
}
