---
language: ts
---

Provides a `/editor` Markdown line-chat modal with persistent hidden per-line sessions, live file reload, diff review, and Tron-styled mini chat.

## Features
- [[features/command/register-editor-command|register-editor-command]]: Registers `/editor` and opens the hardcoded `demo.md` editor modal.
- [[features/modal/show-md-editor-modal|show-md-editor-modal]]: Renders the two-pane Markdown editor, line navigation, focus transitions, and restore state.
- [[features/file/load-demo-markdown-file|load-demo-markdown-file]]: Ensures `demo.md` exists, loads it, and watches it for live reload.
- [[features/line-chat/reconcile-line-chat-sessions|reconcile-line-chat-sessions]]: Keys chats by file path and line number while obsoleting chats for deleted lines.
- [[features/line-chat/persist-line-chat-session|persist-line-chat-session]]: Stores hidden Pi-format line-chat sessions outside the normal resumable session index.
- [[features/chat/render-line-chat|render-line-chat]]: Runs the selected line mini chat with inherited model/provider, tools, context refresh, and Tron rendering.
- [[features/diff/track-markdown-diff|track-markdown-diff]]: Shows live word-level additions and removals until Ctrl+A accepts the baseline.

## File Structure
```text
src/
  extensions/
    md-editor/
      registerMdEditorExtension.ts
      command/
        registerEditorCommand.ts
      modal/
        showMdEditorModal.ts
        MdEditorModal.tsx
        createMdEditorInitialState.ts
        restoreMdEditorState.ts
      file/
        ensureDemoMarkdownFile.ts
        loadDemoMarkdownFile.ts
        watchMarkdownFile.ts
        computeMarkdownFileSnapshot.ts
      line-chat/
        createLineChatKey.ts
        reconcileLineChatSessions.ts
        persistLineChatSession.ts
        readLineChatSession.ts
        markLineChatSessionObsolete.ts
        createLineChatContext.ts
      chat/
        renderLineChat.tsx
        sendLineChatMessage.ts
        cancelLineChatStream.ts
        createLineChatRuntime.ts
      diff/
        trackMarkdownDiff.ts
        acceptMarkdownDiffBaseline.ts
        renderMarkdownDiffTokens.tsx
      e2e/
        editor_command_opens_demo_md.spec.ts
        editor_line_navigation_and_restore.spec.ts
        editor_line_chat_persistence_hidden_resume.spec.ts
        editor_file_reload_diff_accept.spec.ts
        editor_line_chat_context_refresh.spec.ts
        editor_stream_escape_ctrl_c_focus.spec.ts
```

## E2E
| Name | Description |
| --- | --- |
| editor_command_opens_demo_md | `/editor` creates missing `demo.md`, opens the modal, renders Markdown content, and shows line numbers. |
| editor_line_navigation_and_restore | Arrow keys and Vim normal-mode keys move the selected line, Enter focuses chat, and reopening restores line and focus state. |
| editor_line_chat_persistence_hidden_resume | Per-line chats persist across TUI relaunch and never appear in `/resume`. |
| editor_file_reload_diff_accept | Live reload shows added words green and removed words red strikethrough until Ctrl+A accepts the baseline. |
| editor_line_chat_context_refresh | A changed file hash or mtime refreshes the full-file context before the next line-chat turn. |
| editor_stream_escape_ctrl_c_focus | Escape follows Tron input stream cancellation, Ctrl+C from chat returns to the left panel, and Ctrl+C from left closes the modal. |
