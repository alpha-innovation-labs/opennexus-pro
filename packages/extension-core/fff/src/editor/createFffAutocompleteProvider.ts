import { posix } from "node:path";
import type { ReferenceCompletionItem } from "../../../subagent-tintin/src/ui/reference-completion.js";
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
	let request = 0;
	const provider: AutocompleteProvider = {
		triggerCharacters: baseProvider.triggerCharacters,
		async getSuggestions(lines, cursorLine, cursorCol, options) {
			const generation = ++request;
			if (options.signal.aborted) return null;
			const currentLine = lines[cursorLine] ?? "";
			const prefix = extractAtPrefix(currentLine.slice(0, cursorCol));
			// Both sources run even at bare @. Promise callbacks catch synchronous
			// provider failures as well as rejected searches.
			const innerPromise = Promise.resolve().then(() =>
				baseProvider.getSuggestions(lines, cursorLine, cursorCol, options));
			if (!prefix) {
				const inner = await innerPromise;
				return options.signal.aborted || generation !== request ? null : inner;
			}
			const parsed = parseAtPrefix(prefix);
			const [inner, candidates] = await Promise.all([
				innerPromise.catch(() => null),
				Promise.resolve().then(() => runtime.searchFileCandidates(parsed.rawQuery, MAX_RESULTS)).catch(() => null),
			]);
			if (options.signal.aborted || generation !== request) return null;
			// Empty/failed FFF searches still pass inner rows through the same
			// kind-aware path deduplication, retaining their insertion metadata.
			const fileCandidates = candidates ?? [];

			const folderItems = createFolderAutocompleteItems(
				collectFolderSuggestions(fileCandidates, parsed.rawQuery).slice(
					0,
					MAX_RESULTS,
				),
				parsed.isQuotedPrefix,
			);
			const fileItems = fileCandidates.map((candidate) => {
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

			const innerItems: ReferenceCompletionItem[] = (inner?.items ?? []).map((item: ReferenceCompletionItem) => item.reference ? item : ({
				...item,
				reference: {
					kind: item.label.endsWith("/") ? "folder" : "file", identity: item.value,
					source: baseProvider, prefix: inner!.prefix,
					apply: (lines, row, col) => baseProvider.applyCompletion(lines, row, col, item, inner!.prefix),
				},
			}));
			const ranked: ReferenceCompletionItem[] = [...folderItems, ...fileItems].map(item => ({
				...item,
				reference: {
					kind: item.label.endsWith("/") ? "folder" : "file", identity: normalizeInsertedPath(item.value),
					source: provider, prefix,
					apply(lines, row, col) {
						void Promise.resolve().then(() => runtime.trackQuery(prefix, normalizeInsertedPath(item.value))).catch(() => undefined);
						return baseProvider.applyCompletion(lines, row, col, item, prefix);
					},
				},
			}));
			const seen = new Set<string>();
			let fileCount = 0;
			const items = [
				...innerItems.filter(item => item.reference?.kind === "agent"),
				...ranked,
				...innerItems.filter(item => item.reference?.kind !== "agent"),
			].filter(item => {
				const ref = item.reference!;
				const identity = ref.kind === "agent" ? ref.identity
					: posix.normalize(normalizeInsertedPath(item.value).replace(/\\/g, "/")).replace(/\/$/, "");
				const key = `${ref.kind}:${identity}`;
				if (seen.has(key)) return false;
				seen.add(key);
				return ref.kind === "agent" || fileCount++ < MAX_RESULTS;
			});
			return items.length ? { prefix: fileCandidates.length ? prefix : inner!.prefix, items } : null;
		},
		applyCompletion(lines, cursorLine, cursorCol, item, prefix) {
			const reference = (item as ReferenceCompletionItem).reference;
			if (reference) return reference.apply(lines, cursorLine, cursorCol);
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
	return provider;
}
