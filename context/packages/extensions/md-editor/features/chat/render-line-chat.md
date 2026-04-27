Runs the right-panel mini chat with Tron message styling, inherited model/provider, enabled tools, and refreshed file context.

## Usage

```ts
import { renderLineChat } from '../../../../../../src/extensions/md-editor/chat/renderLineChat.js';

renderLineChat({
  pi,
  snapshot,
  selectedLineNumber: 12,
  sessionId,
});
```

## Inputs

```ts
type RenderLineChatInput = {
  pi: ExtensionAPI; // Supplies active model/provider, tool registry, and chat runtime integration.
  snapshot: MarkdownFileSnapshot;
  selectedLineNumber: number;
  sessionId: string;
};

type LineChatContext = {
  filePath: string;
  fullFileContent: string;
  selectedLineNumber: number;
  selectedLineText: string;
  instruction: 'The user is asking about this specific line in this Markdown file.';
};
```

## Outputs

```ts
type RenderLineChatOutput = {
  focused: boolean;
  streaming: boolean;
  savedSessionId: string;
};
```

## Errors

```ts
type RenderLineChatError =
  | { type: 'LineChatContextRefreshError'; message: string }
  | { type: 'LineChatSendError'; message: string }
  | { type: 'LineChatToolExecutionError'; message: string };
```

## E2E

| Name | Description |
| --- | --- |
| editor_line_chat_context_refresh | Inherits the main model/provider, enables tools, includes full-file context, and refreshes context after file hash or mtime changes. |
| editor_stream_escape_ctrl_c_focus | Empty Enter sends nothing, Escape follows Tron input behavior, and Ctrl+C only moves focus back to the left panel. |
