# Agent-aware mention preview

Neo's `@` picker presents agents and files under the title “References.” Its preview dispatches on the selected entry's semantic kind. Agent previews use roster metadata; file entries retain normal file previews.

## Agent information

An agent preview shows its handle, description, and the action submission performs: start for an unused type, send message for a running or queued record, and resume for a settled record with a live session object or a remembered session. Settled records without a session follow the fresh-start fallback described below. Type identity remains visible when an alias replaces the type-derived handle. Available status and metadata, such as model, usage, or session identity, supplement the description without implying information that is not present.

Remembered sessions without live records are labeled resumable rather than assigned an invented live status. The preview action agrees with Tintin's mention dispatcher and does not execute merely because the selection changes. Agent metadata survives [[mention-completion]] rather than being reconstructed by interpreting a label as a path.

### Records without a session

A settled record that failed before establishing a session cannot resume. Its preview follows the dispatcher's fresh-start fallback: the inserted handle (including the supported `agent-` prefix fallback) is resolved against available types. A match shows start and names that type; otherwise the action is continuation in the main conversation. An alias or numbered handle does not automatically resolve to its record's type. A session-file path alone does not make a live record resumable: live-record dispatch requires the session object, while remembered-session dispatch reopens the stored file. The list description and preview use the same action classification without changing submission behavior.

## Preview metadata

The completion item's `reference.agent` holds a display-only roster snapshot: handle, type identity, description, action, and available status, invocation model, session file identity, and tool-use count. It contains no live session object. FFF and the trigger refresh pass this metadata through unchanged; Neo reads it before entering file-preview handling. Missing optional fields are omitted, while an agent entry without a snapshot shows unavailable agent information.

## Preview isolation

`neo-editor/src/features/promptline/AtModal.ts` owns the preview boundary. Agent entries never pass through path resolution, file reads, or file-preview error handling. File and folder entries retain existing path handling, sanitized previews, truncation, and unavailable-preview behavior. A missing agent field is omitted or shown as unavailable agent information, never as a filesystem error.

Selection changes clear unrelated preview content, and asynchronous updates cannot install a preview for a previously selected entry. The shared select-preview modal retains its navigation, scrolling, and close behavior for both kinds of entry. Preview replacement is synchronous, so no deferred preview task can write after a selection change; trigger refresh separately rejects aborted suggestion responses. List resizing restores the selected item by object identity rather than insertion text, keeping same-name agent and file entries distinct.
