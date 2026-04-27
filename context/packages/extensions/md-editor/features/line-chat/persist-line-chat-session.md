Persists each selected-line conversation as hidden Pi-format session data outside the normal `/resume` index.

## Usage

```ts
import { persistLineChatSession } from '../../../../../../src/extensions/md-editor/line-chat/persistLineChatSession.js';

await persistLineChatSession(session, {
  hiddenFromResume: true,
  kind: 'md-editor-line-chat',
});
```

## Inputs

```ts
type PersistLineChatSessionInput = {
  session: PiSessionRecord; // Existing Nexus/Pi session transcript format, including messages, tool calls, and thinking events.
  metadata: {
    kind: 'md-editor-line-chat';
    hiddenFromResume: true;
    filePath: string;
    lineNumber: number;
    lineFingerprint: string;
    lastContextContentHash: string;
    lastContextMtimeMs: number;
    updatedAt: string;
  };
};
```

## Outputs

```ts
type PersistLineChatSessionOutput = {
  sessionId: string;
  sessionPath: string; // Dedicated md-editor folder next to subagent/global session storage.
};
```

## Errors

```ts
type PersistLineChatSessionError =
  | { type: 'LineChatSessionWriteError'; message: string }
  | { type: 'LineChatSessionReadError'; message: string }
  | { type: 'LineChatResumeIndexExclusionError'; message: string };
```

## E2E

| Name | Description |
| --- | --- |
| editor_line_chat_persistence_hidden_resume | Saves after every user message, assistant message, tool event, stream completion, metadata update, and excludes sessions from `/resume`. |
