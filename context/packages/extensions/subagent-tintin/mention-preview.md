# Agent-aware mention preview

Neo's `@` picker presents agents and files under a neutral title such as “References,” not “Find Files.” Its preview dispatches on the selected entry's semantic kind. Agent previews use roster metadata; file entries retain normal file previews.

## Agent information

An agent preview shows its handle, description, and the action submission performs: start for an unused type, send message for a running or queued record, and resume for a settled record or remembered session. Type identity remains visible when an alias replaces the type-derived handle. Available status and metadata, such as model, usage, or session identity, supplement the description without implying information that is not present.

Remembered sessions without live records are labeled resumable rather than assigned an invented live status. The preview action agrees with Tintin's mention dispatcher and does not execute merely because the selection changes. Agent metadata survives [[mention-completion]] rather than being reconstructed by interpreting a label as a path.

## Preview isolation

`neo-editor/src/features/promptline/AtModal.ts` owns the preview boundary. Agent entries never pass through path resolution, file reads, or file-preview error handling. File and folder entries retain existing path handling, sanitized previews, truncation, and unavailable-preview behavior. A missing agent field is omitted or shown as unavailable agent information, never as a filesystem error.

Selection changes clear unrelated preview content, and asynchronous updates cannot install a preview for a previously selected entry. The shared select-preview modal retains its navigation, scrolling, and close behavior for both kinds of entry.
