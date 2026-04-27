Matches persisted line chats to the current file snapshot and obsoletes chats whose original line was deleted.

## Usage

```ts
import { reconcileLineChatSessions } from '../../../../../../src/extensions/md-editor/line-chat/reconcileLineChatSessions.js';

const result = await reconcileLineChatSessions(snapshot, existingSessions);
```

## Inputs

```ts
type LineChatSessionMetadata = {
  filePath: string;
  lineNumber: number;
  lineText: string;
  lineFingerprint: string; // Normalized line text plus nearby context hash from creation time.
  status: 'active' | 'obsolete';
};

type ReconcileLineChatSessionsInput = {
  snapshot: MarkdownFileSnapshot;
  sessions: LineChatSessionMetadata[];
};
```

## Outputs

```ts
type ReconcileLineChatSessionsOutput = {
  active: LineChatSessionMetadata[];
  obsolete: LineChatSessionMetadata[];
};
```

## Errors

```ts
type ReconcileLineChatSessionsError = { type: 'LineChatReconcileError'; message: string };
```

## E2E

| Name | Description |
| --- | --- |
| editor_line_chat_persistence_hidden_resume | Keeps chats attached by canonical file path and line number while hiding obsolete deleted-line chats from the active editor view. |
| editor_file_reload_diff_accept | Reconciles sessions after live reload so inserted, deleted, and reordered lines update indicators deterministically. |
