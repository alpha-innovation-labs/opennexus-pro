import {
	CustomEditor,
	type ExtensionAPI,
	type ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import type { KeybindingsManager } from "@earendil-works/pi-coding-agent";
import type {
	AutocompleteItem,
	AutocompleteProvider,
	EditorTheme,
	TUI,
} from "@earendil-works/pi-tui";
import { matchesKey } from "@earendil-works/pi-tui";
import { wrapAutocompleteProviderForCwd } from "@extensions/fff/editor/wrapAutocompleteProviderForCwd";
import { getRegisteredHotkeysShortcuts } from "@extensions/hotkeys/getRegisteredHotkeysShortcuts";
import { openHotkeysModal } from "@extensions/hotkeys/openHotkeysModal";
import { clearStartupHero } from "@extensions/startup-hero/clearStartupHero";
import { isRuntimeExtensionFeatureEnabled } from "@nexus/feature-flags/runtimeExtensionFeatureState";
import { readClipboardImageViaMacOsJxa } from "@nexus/runtime/clipboard-image/readClipboardImageViaMacOsJxa";
import { writeClipboardImageTempFile } from "@nexus/runtime/clipboard-image/writeClipboardImageTempFile";
import { findMatchingTrigger } from "../editor-triggers/findMatchingTrigger";
import { handleClipboardImagePaste } from "./clipboard/handleClipboardImagePaste";
import type { PromptlineConfig } from "./config/types";
import { isReloadCommandText } from "./isReloadCommandText";
import { logRenderedOverflow } from "./logRenderedOverflow";
import { extractCompleteBracketedPaste } from "./paste/extractCompleteBracketedPaste";
import { normalizeBracketedPasteText } from "./paste/normalizeBracketedPasteText";
import { renderPromptlineEditor } from "./render/renderPromptlineEditor";
import { closeTriggerModal } from "./trigger/closeTriggerModal";
import { getActiveTriggerState } from "./trigger/getActiveTriggerState";
import { getTriggerModal } from "./trigger/getTriggerModal";
import { getTriggerProvider } from "./trigger/getTriggerProvider";
import { isTriggerTextStart } from "./trigger/isTriggerTextStart";
import { refreshTriggerModal } from "./trigger/refreshTriggerModal";
import { resolveTriggerSessionStart } from "./trigger/resolveTriggerSessionStart";
import { routeTriggerInput } from "./trigger/routeTriggerInput";
import {
	clearTriggerSession,
	getTriggerSession,
	startTriggerSession,
	updateTriggerSessionPrefix,
} from "./trigger/sessionState";
import type { TriggerModalState } from "./trigger/types";

const PRIMARY_COLOR = "error";

export class PromptlineEditor extends CustomEditor {
	private promptAutocompleteProvider?: AutocompleteProvider;
	private readonly modalState: TriggerModalState = {};
	private hotkeysModal?: {
		handleInput(data: string): void;
		getEditorMirrorText(): string;
	};
	private promptAutocompletePrefix = "";
	private triggerSubmitInFlight = false;
	private startupHeroCleared = false;

	constructor(
		tui: TUI,
		theme: EditorTheme,
		private readonly editorKeybindings: KeybindingsManager,
		private readonly ctx: ExtensionContext,
		private readonly uiTheme: ExtensionContext["ui"]["theme"],
		private readonly getThinkingLevel: ExtensionAPI["getThinkingLevel"],
		private readonly setThinkingLevel: ExtensionAPI["setThinkingLevel"],
		readonly _getSessionName: ExtensionAPI["getSessionName"],
		private readonly getPromptlineConfig: () => PromptlineConfig,
		private readonly refreshPromptlineConfig: (
			cwd: string,
		) => Promise<PromptlineConfig>,
		private readonly getCommands: ExtensionAPI["getCommands"] = () => [],
		private readonly getAllTools: ExtensionAPI["getAllTools"] = () => [],
	) {
		super(tui, theme, editorKeybindings);
	}
	/** Cancels Pi's stock autocomplete when the custom slash modal is active. */
	private suppressBaseAutocomplete(): void {
		(
			this as unknown as { cancelAutocomplete?: () => void }
		).cancelAutocomplete?.();
	}
	/** Clears the startup hero before the first typed prompt render. */
	private clearStartupHeroOnTyping(): void {
		if (this.startupHeroCleared) return;
		this.startupHeroCleared = true;
		clearStartupHero(this.ctx);
	}
	/** Reloads cached promptline config after an explicit reload command completes. */
	private refreshConfigAfterReload(
		commandText: string,
		submission: Promise<unknown>,
	): void {
		if (!isReloadCommandText(commandText)) return;
		void submission.then(async () => {
			await this.refreshPromptlineConfig(this.ctx.cwd);
			await this.refreshTriggerModal();
			this.tui.requestRender();
		});
	}
	/** Applies one cached submit trigger match when editor text exactly matches a rule. */
	private handleConfiguredTriggers(text: string): void {
		if (
			!text.trim() ||
			this.triggerSubmitInFlight ||
			this.onSubmit === undefined
		)
			return;
		const { triggerConfig, neoConfig } = this.getPromptlineConfig();
		const match = findMatchingTrigger(triggerConfig, text);
		if (match?.action.type !== "submit" || this.getText() !== text) return;
		this.triggerSubmitInFlight = true;
		if (neoConfig.clearEditorOnTriggerSubmit) {
			super.setText("");
		}
		const submission = Promise.resolve(
			(this.onSubmit as (value: string) => unknown)(text),
		);
		this.refreshConfigAfterReload(text, submission);
		void submission.finally(() => {
			this.triggerSubmitInFlight = false;
		});
	}
	/** Returns whether current typing can match a configured submit trigger. */
	private shouldCheckConfiguredTriggers(): boolean {
		const { triggerConfig } = this.getPromptlineConfig();
		if (triggerConfig.rules.length === 0) return false;
		return (this.getLines()[0] ?? "").startsWith("/");
	}
	/** Returns whether current typing state requires modal refresh work. */
	private shouldRefreshTriggerModal(): boolean {
		const cursor = this.getCursor();
		const line = this.getLines()[cursor.line] ?? "";
		return Boolean(
			getTriggerSession() ||
				getActiveTriggerState(line.slice(0, cursor.col)) ||
				this.modalState.atModal ||
				this.modalState.slashModal,
		);
	}
	/** Refreshes the active `@` or `/` modal from the current editor state. */
	private async refreshTriggerModal(): Promise<void> {
		const cursor = this.getCursor();
		const line = this.getLines()[cursor.line] ?? "";
		const triggerState = getActiveTriggerState(line.slice(0, cursor.col));
		const refreshed = await refreshTriggerModal(
			triggerState,
			this.modalState,
			this.ctx,
			this.uiTheme,
			this.promptAutocompleteProvider,
			() => this.getThinkingLevel(),
			(value) => this.setThinkingLevel(value as never),
			this.getCommands,
			this.getAllTools,
			this.getLines(),
			cursor.line,
			cursor.col,
			() => this.tui.requestRender(),
			(value) => this.setText(value),
			(value) => this.submitEditorText(value),
			(item) => this.applyAutocompleteItem(item),
			this.tui.showOverlay.bind(this.tui) as never,
		);
		this.promptAutocompletePrefix =
			refreshed.autocompletePrefix ?? this.promptAutocompletePrefix;
		if (triggerState) updateTriggerSessionPrefix(triggerState.prefix);
		else if (!this.modalState.atModal && !this.modalState.slashModal)
			clearTriggerSession();
	}
	/** Installs the wrapped autocomplete provider. */
	setAutocompleteProvider(provider: AutocompleteProvider): void {
		this.promptAutocompleteProvider = provider;
		void wrapAutocompleteProviderForCwd(this.ctx.cwd, provider).then(
			(wrappedProvider) => {
				if (this.promptAutocompleteProvider === provider)
					this.promptAutocompleteProvider = wrappedProvider;
			},
		);
	}
	/** Applies one picked autocomplete item into the editor. */
	private applyAutocompleteItem(item: AutocompleteItem): void {
		if (!this.promptAutocompleteProvider) return;
		const cursor = this.getCursor();
		const result = this.promptAutocompleteProvider.applyCompletion(
			this.getLines(),
			cursor.line,
			cursor.col,
			item,
			this.promptAutocompletePrefix,
		);
		const state = this as unknown as { state: { lines: string[]; cursorLine: number } };
		state.state.lines = result.lines;
		state.state.cursorLine =
			result.cursorLine;
		(this as unknown as { setCursorCol: (col: number) => void }).setCursorCol(
			result.cursorCol,
		);
		closeTriggerModal(this.modalState, () => this.tui.requestRender());
	}
	/** Submits one slash command immediately through the editor submit path. */
	private submitEditorText(value: string): void {
		this.addToHistory(value);
		super.setText("");
		if (this.onChange) this.onChange("");
		if (!this.onSubmit) return;
		const submission = Promise.resolve(
			(this.onSubmit as (text: string) => unknown)(value),
		);
		this.refreshConfigAfterReload(value, submission);
	}
	override setText(text: string): void {
		clearTriggerSession();
		super.setText(text);
		this.handleConfiguredTriggers(this.getText());
	}
	/** Opens the hotkeys modal from an empty editor. */
	private openHotkeysModal(): void {
		const opened = openHotkeysModal(
			this.uiTheme,
			this.editorKeybindings as never,
			getRegisteredHotkeysShortcuts(),
			this.tui.showOverlay.bind(this.tui) as never,
			() => {
				this.hotkeysModal = undefined;
				this.tui.requestRender();
			},
		);
		this.hotkeysModal = opened.modal;
		this.tui.requestRender();
	}
	/** Returns whether a help trigger should open the hotkeys modal. */
	private shouldOpenHotkeys(data: string): boolean {
		const cursor = this.getCursor();
		return (
			isRuntimeExtensionFeatureEnabled("hotkeys") &&
			data === "?" &&
			this.getText().length === 0 &&
			cursor.line === 0 &&
			cursor.col === 0
		);
	}
	/** Inserts a complete bracketed paste as raw text instead of Pi's paste marker. */
	private handleRawBracketedPaste(data: string): boolean {
		const paste = extractCompleteBracketedPaste(data);
		if (!paste) return false;
		if (paste.before) super.handleInput(paste.before);
		this.insertTextAtCursor(normalizeBracketedPasteText(paste.content));
		if (paste.after) this.handleInput(paste.after);
		return true;
	}
	/** Handles Pi's configured image-paste key without swallowing normal text paste. */
	private handleClipboardImagePaste(data: string): boolean {
		return handleClipboardImagePaste({
			platform: process.platform,
			data,
			matchesPasteImage: (value) =>
				this.editorKeybindings.matches(value, "app.clipboard.pasteImage"),
			readImage: readClipboardImageViaMacOsJxa,
			writeTempFile: writeClipboardImageTempFile,
			pasteToEditor: (value) => this.ctx.ui.pasteToEditor(value),
		});
	}
	override handleInput(data: string): void {
		this.clearStartupHeroOnTyping();
		if (this.hotkeysModal) {
			this.hotkeysModal.handleInput(data);
			super.setText(this.hotkeysModal.getEditorMirrorText());
			if (this.onChange) this.onChange(this.getText());
			this.tui.requestRender();
			return;
		}
		if (this.handleClipboardImagePaste(data)) return;
		if (this.handleRawBracketedPaste(data)) return;
		if (this.shouldOpenHotkeys(data)) {
			this.openHotkeysModal();
			return;
		}
		const activeSession = getTriggerSession();
		if (activeSession?.kind === "slash") this.suppressBaseAutocomplete();
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
			? resolveTriggerSessionStart(
					data,
					line.slice(0, cursor.col),
					this.getText(),
				)
			: null;
		if (
			triggerSessionStart?.kind === "slash" &&
			!isRuntimeExtensionFeatureEnabled("slash-menu")
		) {
			super.handleInput(data);
			if (this.shouldCheckConfiguredTriggers())
				this.handleConfiguredTriggers(this.getText());
			return;
		}
		if (triggerSessionStart) {
			startTriggerSession(triggerSessionStart.kind, triggerSessionStart.prefix);
			super.handleInput(data);
			if (triggerSessionStart.kind === "slash") this.suppressBaseAutocomplete();
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
		if (this.shouldRefreshTriggerModal()) void this.refreshTriggerModal();
		if (this.shouldCheckConfiguredTriggers())
			this.handleConfiguredTriggers(this.getText());
	}
	override render(width: number): string[] {
		const cursor = this.getCursor();
		const line = this.getLines()[cursor.line] ?? "";
		const triggerState = getActiveTriggerState(line.slice(0, cursor.col));
		this.borderColor = (text: string) =>
			(this.uiTheme.fg as (color: string, text: string) => string)(PRIMARY_COLOR, text);
		if (triggerState?.kind === "slash" && !this.modalState.slashModal)
			return super.render(width);
		if (this.getPaddingX() !== 1) this.setPaddingX(1);
		const lines = renderPromptlineEditor(
			width,
			(frameWidth) => super.render(Math.max(1, frameWidth - 2)),
			this.borderColor,
			this.uiTheme,
			this.ctx,
			this.getThinkingLevel,
		);
		logRenderedOverflow(lines, width);
		return lines;
	}
}
