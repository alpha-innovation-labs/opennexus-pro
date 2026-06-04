# Observations plan

## Purpose

- Observations track user intent over time.
- A topic represents a clear user intent, not every individual message.
- Topic drift happens when the latest user message no longer fits the current intent.
- Observation titles must clearly name the user intent.
- Assistant bullets summarize decisions, findings, implementation direction, or outcomes for the current topic.

## Storage

- Observations use one JSON artifact per conversation.
- The artifact path is `<conversation-id>.json` in the observations directory.
- The JSON keeps the current state shape: conversation metadata, message count, summary, topics, source message indexes, user excerpts, and assistant bullets.
- Legacy `.state.json`, `.messages.json`, and `.observations.md` files are cleanup/read-compatibility only.
- `nexus observations view <session-id>` renders markdown from the JSON state.

## Live session behavior

- Live observation tracking is incremental.
- The first user message starts the first topic.
- For the first user message, the LLM classifies the initial intent.
- After that, Nexus keeps the current intent topic.
- On a new user message, Nexus gives the LLM:
  - the messages in the current intent batch
  - the latest user message
- The LLM must answer either:
  - do nothing because the latest message fits the current intent
  - return a new topic title because user intent shifted
- Nexus creates a new topic only when the LLM reports an intent shift.
- Assistant observations keep attaching to the current topic.

## Recreate behavior

- Recreate remains different from live tracking.
- Recreate uses a single LLM pass over the full session history.
- In recreate, the LLM segments the full history into intent topics at once.
- Recreate should not run per-message LLM calls.
- Recreate should write only the single `<conversation-id>.json` artifact.

## Prompt editing

- Editing the observation prompt is dev-only.
- Release Nexus should not expose observation prompt editing.
- In dev, `/observations` shows an `e edit prompt` footer hotkey.
- The `e` hotkey opens the prompt in the configured external `$EDITOR`, matching `/SystemPrompt` behavior.
- Prompt overrides are stored in observations storage and can use the `{{messages}}` placeholder.

## Prompt responsibility

- Nexus reads session messages and sends them to the LLM.
- The LLM decides intent grouping and observation wording.
- Nexus parses and validates the LLM JSON output.
- Nexus adds metadata such as conversation ID, session path, timestamps, message count, and source indexes.
- Nexus writes the final observation JSON file.
