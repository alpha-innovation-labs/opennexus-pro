import { CustomEditor, type ExtensionAPI, type ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem, AutocompleteProvider } from "@mariozechner/pi-tui";
import { matchesKey, visibleWidth } from "@mariozechner/pi-tui";
import { getUsageTextForModel } from "../../../pi-slash-usage/index.js";
import { wrapAutocompleteProviderForCwd } from "../../fff/editor/wrapAutocompleteProviderForCwd.js";
import { findMatchingTrigger } from "../editor-triggers/findMatchingTrigger.js";
import { readEditorTriggerConfig } from "../editor-triggers/readEditorTriggerConfig.js";
import { readNeoConfig } from "../readNeoConfig.js";
import { renderBottomBorderLabel } from "../ui/renderBottomBorderLabel.js";
import { renderUsageText } from "../ui/renderUsageText.js";
import { buildPromptline } from "./render/buildPromptline.js";
import { extractEditorContentLines } from "./extractEditorContentLines.js";
import { padToWidth } from "./padToWidth.js";
import { prefixEditorLine } from "./prefixEditorLine.js";
import { renderPromptlineBorder } from "./render/renderPromptlineBorder.js";
import { closeTriggerModal } from "./trigger/closeTriggerModal.js";
import { getActiveTriggerState } from "./trigger/getActiveTriggerState.js";
import { refreshTriggerModal } from "./trigger/refreshTriggerModal.js";
import { clearTriggerSession, getTriggerSession, startTriggerSession, updateTriggerSessionPrefix } from "./trigger/sessionState.js";
import { getTriggerModal } from "./trigger/getTriggerModal.js";
import { getTriggerProvider } from "./trigger/getTriggerProvider.js";
import { isTriggerTextStart } from "./trigger/isTriggerTextStart.js";
import { routeTriggerInput } from "./trigger/routeTriggerInput.js";
import { resolveTriggerSessionStart } from "./trigger/resolveTriggerSessionStart.js";
import type { TriggerModalState } from "./trigger/types.js";
import { logExtensionEvent } from "../../shared/observability/startup-debug.ts";

const PRIMARY_COLOR = "error";

/**
 * Custom Neo editor with unified trigger-modal behavior for `@` and `/`.
 */
export class PromptlineEditor extends CustomEditor {
  private autocompleteProvider?: AutocompleteProvider;
  private readonly modalState: TriggerModalState = {};
  private autocompletePrefix = "";
  private triggerSubmitInFlight = false;

  /**
   * Cancels the underlying Pi autocomplete UI so the Nexus slash modal is the only visible picker.
   */
  private suppressBaseAutocomplete(): void {
    (this as unknown as { cancelAutocomplete?: () => void }).cancelAutocomplete?.();
  }

  constructor(
    tui: any,
    theme: any,
    keybindings: any,
    private readonly ctx: ExtensionContext,
    private readonly uiTheme: ExtensionContext["ui"]["theme"],
    private readonly getThinkingLevel: ExtensionAPI["getThinkingLevel"],
    private readonly setThinkingLevel: ExtensionAPI["setThinkingLevel"],
    private readonly getSessionName: ExtensionAPI["getSessionName"],
  ) {
    super(tui, theme, keybindings);
  }

  /**
   * Installs the wrapped autocomplete provider.
   *
   * @param provider Base autocomplete provider.
   */
  setAutocompleteProvider(provider: AutocompleteProvider): void {
    this.autocompleteProvider = provider;
    void wrapAutocompleteProviderForCwd(this.ctx.cwd, provider).then((wrappedProvider) => {
      if (this.autocompleteProvider === provider) {
        this.autocompleteProvider = wrappedProvider;
      }
    });
  }

  /**
   * Applies one picked autocomplete item into the editor.
   *
   * @param item Picked item.
   */
  private applyAutocompleteItem(item: AutocompleteItem): void {
    if (!this.autocompleteProvider) return;
    const cursor = this.getCursor();
    const result = this.autocompleteProvider.applyCompletion(this.getLines(), cursor.line, cursor.col, item, this.autocompletePrefix);
    (this as any).state.lines = result.lines;
    (this as any).state.cursorLine = result.cursorLine;
    (this as any).setCursorCol(result.cursorCol);
    closeTriggerModal(this.modalState, () => this.tui.requestRender());
  }

  /**
   * Submits one slash command immediately through the editor submit path.
   *
   * @param value Slash command text.
   */
  private submitEditorText(value: string): void {
    this.addToHistory(value);
    super.setText("");
    if (this.onChange) this.onChange("");
    if (this.onSubmit) this.onSubmit(value);
  }

  /**
   * Checks configured submit triggers against the current editor text.
   *
   * @param text Current editor text.
   */
  private async handleConfiguredTriggers(text: string): Promise<void> {
    if (!text.trim() || this.triggerSubmitInFlight) return;
    const [triggerConfig, neoConfig] = await Promise.all([
      readEditorTriggerConfig(this.ctx.cwd),
      readNeoConfig(this.ctx.cwd),
    ]);
    const match = findMatchingTrigger(triggerConfig, text);
    if (!match || match.action.type !== "submit") return;
    if (this.getText() !== text || !this.onSubmit) return;
    this.triggerSubmitInFlight = true;
    try {
      if (neoConfig.clearEditorOnTriggerSubmit) {
        super.setText("");
      }
      await Promise.resolve((this.onSubmit as (value: string) => unknown)(text));
    } finally {
      this.triggerSubmitInFlight = false;
    }
  }

  /**
   * Refreshes the unified trigger modal from the current cursor state.
   */
  private async refreshTriggerModal(): Promise<void> {
    const cursor = this.getCursor();
    const line = this.getLines()[cursor.line] ?? "";
    const triggerState = getActiveTriggerState(line.slice(0, cursor.col));
    const refreshed = await refreshTriggerModal(
      triggerState,
      this.modalState,
      this.ctx,
      this.uiTheme,
      this.autocompleteProvider,
      () => this.getThinkingLevel(),
      (value) => this.setThinkingLevel(value as never),
      this.getLines(),
      cursor.line,
      cursor.col,
      () => this.tui.requestRender(),
      (value) => this.setText(value),
      (value) => this.submitEditorText(value),
      (item) => this.applyAutocompleteItem(item),
      this.tui.showOverlay.bind(this.tui),
    );
    this.autocompletePrefix = refreshed.autocompletePrefix ?? this.autocompletePrefix;
    if (triggerState) updateTriggerSessionPrefix(triggerState.prefix);
  }

  override setText(text: string): void {
    clearTriggerSession();
    super.setText(text);
    void this.handleConfiguredTriggers(this.getText());
  }

  override handleInput(data: string): void {
    const activeSession = getTriggerSession();
    if (activeSession?.kind === "slash") {
      this.suppressBaseAutocomplete();
    }
    if (activeSession) {
      const activeModal = getTriggerModal(this.modalState, activeSession.kind);
      const activeProvider = getTriggerProvider(activeSession.kind);
      if (activeModal && activeProvider.routeInput(data, routeTriggerInput)) {
        activeModal.handleInput(data);
        this.tui.requestRender();
        return;
      }
    }
    const cursor = this.getCursor();
    const line = this.getLines()[cursor.line] ?? "";
    const triggerSessionStart = isTriggerTextStart(data)
      ? resolveTriggerSessionStart(data, line.slice(0, cursor.col), this.getText())
      : null;
    if (triggerSessionStart) {
      startTriggerSession(triggerSessionStart.kind, triggerSessionStart.prefix);
      super.handleInput(data);
      if (triggerSessionStart.kind === "slash") {
        this.suppressBaseAutocomplete();
      }
      void this.refreshTriggerModal();
      this.tui.requestRender();
      return;
    }
    if (matchesKey(data, "ctrl+r")) {
      closeTriggerModal(this.modalState, () => this.tui.requestRender());
      this.setText("/reload");
      this.tui.requestRender();
      return;
    }

    super.handleInput(data);
    void this.refreshTriggerModal().then(() => {
      const refreshedCursor = this.getCursor();
      const refreshedLine = this.getLines()[refreshedCursor.line] ?? "";
      if (!getActiveTriggerState(refreshedLine.slice(0, refreshedCursor.col))) {
        clearTriggerSession();
      }
    });
    void this.handleConfiguredTriggers(this.getText());
  }

  override render(width: number): string[] {
    const cursor = this.getCursor();
    const line = this.getLines()[cursor.line] ?? "";
    const triggerState = getActiveTriggerState(line.slice(0, cursor.col));
    if (triggerState?.kind === "slash" && !this.modalState.slashModal) {
      this.borderColor = (text: string) => this.uiTheme.fg(PRIMARY_COLOR as any, text);
      return super.render(width);
    }

    this.borderColor = (text: string) => this.uiTheme.fg(PRIMARY_COLOR as any, text);
    if (this.getPaddingX() !== 1) this.setPaddingX(1);
    const innerWidth = Math.max(1, width - 2);
    const baseLines = super.render(innerWidth);
    if (baseLines.length === 0) return baseLines;
    const editorContent = extractEditorContentLines(baseLines);
    const top = this.borderColor("╭")
      + renderPromptlineBorder(this.borderColor, this.uiTheme, innerWidth, buildPromptline(this.ctx, this.uiTheme, this.getThinkingLevel, innerWidth))
      + this.borderColor("╮");
    const bottom = this.borderColor("╰")
      + renderBottomBorderLabel(this.borderColor, this.uiTheme, innerWidth, renderUsageText(this.uiTheme, getUsageTextForModel(this.ctx.model)))
      + this.borderColor("╯");
    const contentLines = editorContent.map((entry) => padToWidth(entry, innerWidth));
    if (contentLines.length > 0) {
      contentLines[0] = prefixEditorLine(contentLines[0]!.replace(/^\s+/, ""), innerWidth, "» ", (text) => this.uiTheme.fg(PRIMARY_COLOR as any, text));
    }
    const middle = contentLines.map((entry) => this.borderColor("│") + padToWidth(entry, innerWidth) + this.borderColor("│"));
    const lines = [top, ...middle, bottom];
    for (const [index, renderedLine] of lines.entries()) {
      const renderedWidth = visibleWidth(renderedLine);
      if (renderedWidth > width) {
        logExtensionEvent("neo-editor", "overflow", { width, lineIndex: index, renderedWidth });
      }
    }
    return lines;
  }
}
