Renders the two-pane Markdown editor modal and owns line navigation, focus transitions, indicators, and restored state.

## Usage

```ts
import { showMdEditorModal } from '../../../../../../src/extensions/md-editor/modal/showMdEditorModal.js';

await showMdEditorModal(pi, {
  fileName: 'demo.md',
});
```

## Inputs

```ts
type ShowMdEditorModalInput = {
  pi: ExtensionAPI; // Provides modal, session, keyboard, and active model/provider access.
  fileName: 'demo.md'; // Hardcoded file opened by /editor.
};

type MdEditorModalState = {
  selectedLineNumber: number;
  focus: 'left-panel' | 'right-chat';
  lineChatIndicators: Record<number, boolean>; // True when the visible line has an existing chat.
};
```

## Outputs

```ts
type ShowMdEditorModalOutput = {
  closed: boolean;
  lastSelectedLineNumber: number;
  lastFocus: 'left-panel' | 'right-chat';
};
```

## Errors

```ts
type ShowMdEditorModalError =
  | { type: 'MarkdownFileLoadError'; message: string }
  | { type: 'LineChatRestoreError'; message: string }
  | { type: 'ModalRenderError'; message: string };
```

## E2E

| Name | Description |
| --- | --- |
| editor_line_navigation_and_restore | Supports arrow keys, Vim normal-mode line movement, Enter to focus chat, visible chat indicators, and state restore. |
| editor_stream_escape_ctrl_c_focus | Ctrl+C from chat returns focus left, Ctrl+C from left closes, and Escape is delegated to the right chat input behavior. |
