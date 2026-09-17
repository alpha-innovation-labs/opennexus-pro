# Agent and file completion

Neo's `@` suggestions combine Tintin agent targets with FFF file and folder results. Agents appear first without suppressing file search, including at a bare `@`. Completion preserves each provider's replacement span and insertion behavior.

## Provider composition

Tintin's `src/ui/agent-mention.ts` supplies the same roster used by mention dispatch: running or queued records, resumable records and remembered sessions, then available agent types. Aliases list once per agent while both alias and type-derived handles remain addressable. Matching retains Tintin's case-insensitive handle-prefix semantics and mention enablement settings.

Neo's `src/features/promptline/PromptlineEditor.ts` installs the FFF wrapper from `fff/src/editor/createFffAutocompleteProvider.ts`. That outer wrapper retains inner agent suggestions even when FFF finds paths. FFF replaces duplicate file-search results, not agent results. Stable ordering keeps agents before files and preserves FFF file/folder ranking; file-result limits do not eliminate the file section merely because agents match.

## Identity and replacement spans

Merged entries retain their semantic kind, source provider, and completion prefix or replacement span. Only entries with compatible spans share a response prefix; other entries retain source-specific completion context rather than borrowing the first provider's prefix. Quoted paths, spaces, path separators, punctuation boundaries, and a cursor inside a line keep their original provider semantics. Applying an agent inserts its handle and normal completion spacing, not a normalized filesystem path, and does not record a file-search selection.

Deduplication uses target identity for agents and normalized path identity for file entries, with kind retained. An agent and a file with the same displayed name remain distinct choices. Repeated wrappers and overlapping file providers do not duplicate rows. Cancellation and stale responses cannot replace newer suggestions; file-search failure preserves available agent suggestions, and absence of agents preserves normal file completion. Empty, throwing, and rejected FFF searches still deduplicate the inner results by kind and normalized path while preserving their original insertion callbacks and response prefix. With no remaining suggestions, the provider returns no result.

### In-process completion metadata

`src/ui/reference-completion.d.ts` defines the shared `ReferenceCompletionItem` contract. Its `reference` field carries the semantic kind, target identity, originating provider, original prefix, and a text-only insertion callback. Wrappers preserve existing metadata and attach it to unannotated file results before merging. This keeps source-specific replacement spans intact even when the picker passes a single response prefix. FFF tracks selections only inside its own file insertion callback; agent insertion bypasses file providers entirely.

## Selection boundary

Choosing a suggestion completes editor text; it does not start or message an agent by itself. Submission retains upstream mention dispatch and its configured model/direct/off behavior. [[mention-preview]] describes how the picker distinguishes agent actions from file previews.
