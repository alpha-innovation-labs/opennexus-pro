import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { Key, matchesKey } from "@earendil-works/pi-tui";
import type { PromptQueueController } from "./PromptQueueController.js";
import { handlePromptQueueInput } from "./handlePromptQueueInput.js";
import { renderPromptQueue } from "./renderPromptQueue.js";
import { shouldBypassPromptQueueEnter } from "./shouldBypassPromptQueueEnter.js";
import { shouldQueuePromptOnEnter } from "./shouldQueuePromptOnEnter.js";
import { hasConversationMessages } from "../neo-editor/features/promptline/layout/hasConversationMessages.js";
import { PromptlineEditor } from "../neo-editor/features/promptline/PromptlineEditor.js";
import type { PromptlineConfig } from "../neo-editor/features/promptline/config/types.js";

/** Adds persisted prompt queue behavior around the base Neo promptline editor. */
export class QueuedPromptlineEditor extends PromptlineEditor {
  private loadedQueueItemId?: string;

  /**
   * Creates a queued promptline editor.
   *
   * @param tui TUI host.
   * @param theme Editor theme.
   * @param editorKeybindings Active editor keybindings.
   * @param ctx Extension context.
   * @param uiTheme Nexus UI theme.
   * @param getThinkingLevel Thinking-level getter.
   * @param setThinkingLevel Thinking-level setter.
   * @param getSessionName Session-name getter.
   * @param getPromptlineConfig Promptline config getter.
   * @param refreshPromptlineConfig Promptline config refresher.
   * @param promptQueue Prompt queue controller.
   * @param isAgentIdle Assistant idle-state getter.
   * @param getCommands Slash command getter.
   */
  constructor(tui: any, theme: any, editorKeybindings: any, private readonly queueCtx: ExtensionContext, private readonly queueUiTheme: ExtensionContext["ui"]["theme"], getThinkingLevel: ExtensionAPI["getThinkingLevel"], setThinkingLevel: ExtensionAPI["setThinkingLevel"], getSessionName: ExtensionAPI["getSessionName"], getPromptlineConfig: () => PromptlineConfig, refreshPromptlineConfig: (cwd: string) => Promise<PromptlineConfig>, private readonly promptQueue: PromptQueueController, private readonly isAgentIdle: () => boolean, getCommands: ExtensionAPI["getCommands"] = () => []) {
    super(tui, theme, editorKeybindings, queueCtx, queueUiTheme, getThinkingLevel, setThinkingLevel, getSessionName, getPromptlineConfig, refreshPromptlineConfig, getCommands);
  }

  /** Queues or replaces editor text, then clears the editor. */
  private queueEditorText(): void {
    if (this.loadedQueueItemId) {
      this.promptQueue.update(this.loadedQueueItemId, this.getText());
      this.loadedQueueItemId = undefined;
    } else if (!this.promptQueue.enqueue(this.getText())) return;
    super.setText("");
    if (this.onChange) this.onChange("");
    this.tui.requestRender();
  }

  /** Submits one prompt immediately through the editor submit path. */
  private submitQueuedEditorText(value: string): void {
    if (!value.trim()) return;
    this.addToHistory(value);
    super.setText("");
    if (this.onChange) this.onChange("");
    if (this.loadedQueueItemId) this.promptQueue.remove(this.loadedQueueItemId);
    this.loadedQueueItemId = undefined;
    if (this.onSubmit) (this.onSubmit as (text: string) => unknown)(value);
  }

  /** Handles queue navigation input when the queue box is focused. */
  private handleQueueInput(data: string): boolean {
    return handlePromptQueueInput(data, this.promptQueue, {
      loadText: (text, itemId) => {
        this.loadedQueueItemId = itemId;
        super.setText(text);
        if (this.onChange) this.onChange(text);
      },
      requestRender: () => this.tui.requestRender(),
      sendText: (text) => this.submitQueuedEditorText(text),
    });
  }

  /** Returns whether Neo owns an active trigger modal. */
  private hasActiveTriggerModal(): boolean {
    const modalState = (this as unknown as { modalState?: { atModal?: unknown; slashModal?: unknown } }).modalState;
    return Boolean(modalState?.atModal || modalState?.slashModal);
  }

  /** Routes queue hotkeys before falling back to the base promptline editor. */
  override handleInput(data: string): void {
    if (this.promptQueue.isDispatchPending() && matchesKey(data, Key.escape)) {
      this.promptQueue.cancelPendingDispatch();
      this.tui.requestRender();
      return;
    }
    if (shouldBypassPromptQueueEnter(data, this.isShowingAutocomplete(), this.hasActiveTriggerModal())) {
      super.handleInput(data);
      return;
    }
    if (this.handleQueueInput(data)) return;
    if (matchesKey(data, Key.ctrlShift("m"))) {
      this.promptQueue.toggleFocus();
      this.tui.requestRender();
      return;
    }
    if (matchesKey(data, Key.enter) && !this.isShowingAutocomplete()) {
      if (this.loadedQueueItemId || shouldQueuePromptOnEnter(this.isAgentIdle())) this.queueEditorText();
      else this.submitQueuedEditorText(this.getText());
      return;
    }
    if (matchesKey(data, Key.alt("enter")) && !this.isShowingAutocomplete()) {
      this.submitQueuedEditorText(this.getText());
      return;
    }
    super.handleInput(data);
    if (this.loadedQueueItemId && this.getText().trim().length === 0) {
      this.promptQueue.remove(this.loadedQueueItemId);
      this.loadedQueueItemId = undefined;
    }
  }

  /** Renders the prompt queue box above the base Neo editor. */
  override render(width: number): string[] {
    return [
      ...renderPromptQueue(width, this.promptQueue.getItems(), this.promptQueue.getSelected()?.id, this.promptQueue.isFocused(), this.queueUiTheme, hasConversationMessages(this.queueCtx), Boolean(this.loadedQueueItemId), (id) => this.promptQueue.isPendingDispatchItem(id)),
      ...super.render(width),
    ];
  }
}
