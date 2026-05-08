import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { AuthImportSource } from "@nexus/pi-platform/login-import/model/AuthImportSource.js";
import type { AuthImportCandidate } from "@nexus/pi-platform/login-import/model/AuthImportCandidate.js";
import { loadAuthImportCandidates } from "@nexus/pi-platform/login-import/collect/loadAuthImportCandidates.js";
import { importAuthCandidates } from "@nexus/pi-platform/login-import/import/importAuthCandidates.js";
import { getAuthImportSourceLabel } from "@nexus/pi-platform/login-import/model/getAuthImportSourceLabel.js";
import { Key, matchesKey } from "@mariozechner/pi-tui";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";
import { createPanelOverlayOptions } from "../overlay/createPanelOverlayOptions.js";
import { getRegisteredHotkeysShortcuts } from "../hotkeys/getRegisteredHotkeysShortcuts.js";
import { HotkeysModal } from "../hotkeys/HotkeysModal.js";
import { applySlashMenuLeaf } from "./applySlashMenuLeaf.js";
import { applySlashMenuSettingValue } from "./applySlashMenuSettingValue.js";
import { calculateModelMenuWidth } from "./calculateModelMenuWidth.js";
import { calculateSettingsMenuWidth } from "./calculateSettingsMenuWidth.js";
import { calculateSinglePaneMenuWidth } from "./calculateSinglePaneMenuWidth.js";
import { calculateTopLevelMenuWidth } from "./calculateTopLevelMenuWidth.js";
import { createActiveLeaves } from "./createActiveLeaves.js";
import { createAuthImportCandidateLeaves } from "./createAuthImportCandidateLeaves.js";
import { createLoadingLeaf } from "./createLoadingLeaf.js";
import { createNameInputLeaf } from "./createNameInputLeaf.js";
import { createScopedModelLeaves } from "./createScopedModelLeaves.js";
import { getDynamicSlashCommands } from "./getDynamicSlashCommands.js";
import { createSettingChoiceLeaves } from "./createSettingChoiceLeaves.js";
import { createSlashMenuPreviewLines } from "./createSlashMenuPreviewLines.js";
import { createThinkingSettingLeaf } from "./createThinkingSettingLeaf.js";
import { createTopLevelItems } from "./createTopLevelItems.js";
import { encodeSlashMenuValue } from "./encodeSlashMenuValue.js";
import { createResumeScopeHeaderTitle } from "./resume-scope/createResumeScopeHeaderTitle.js";
import { getCachedResumeLeaves } from "./resume-scope/getCachedResumeLeaves.js";
import { getNextResumeScope } from "./resume-scope/getNextResumeScope.js";
import type { ResumeScope } from "./resume-scope/ResumeScope.js";
import { filterMenuItems } from "./filterMenuItems.js";
import { formatSettingsMenuLabel } from "./formatSettingsMenuLabel.js";
import { formatTopLevelMenuLabel } from "./formatTopLevelMenuLabel.js";
import { getSettingChoiceTitle } from "./getSettingChoiceTitle.js";
import { getSlashMenuItemIcon } from "./getSlashMenuItemIcon.js";
import { getSlashMenuLevelTitle } from "./getSlashMenuLevelTitle.js";
import type { ResourceCommandScope } from "./ResourceCommandScope.js";
import { renderResourceCommandScopeTabs } from "./renderResourceCommandScopeTabs.js";
import { selectResourceCommandScopeByKey } from "./selectResourceCommandScopeByKey.js";
import { createResourceCommandFooterHint } from "./createResourceCommandFooterHint.js";
import { formatResourceCommandLabel } from "./formatResourceCommandLabel.js";
import { formatLoginProviderLabel } from "./formatLoginProviderLabel.js";
import { handleSlashMenuInput } from "./handleSlashMenuInput.js";
import { showSessionInfoModal } from "./session-info/showSessionInfoModal.js";
import { handleTopLevelMenuEnter } from "./handleTopLevelMenuEnter.js";
import { isSlashTextInput } from "./isSlashTextInput.js";
import { sanitizeSessionNameInput } from "./sanitizeSessionNameInput.js";
import { shouldShowSlashMenuPreview } from "./shouldShowSlashMenuPreview.js";
import { logoutProvider } from "./model/logoutProvider.js";
import { resolveRequestedSlashMenuLevel } from "./resolveRequestedSlashMenuLevel.js";
import type { SlashMenuLevel } from "./SlashMenuLevel.js";
import { toAutocompleteItems } from "./toAutocompleteItems.js";
import { toggleAuthImportCandidateSelection } from "./toggleAuthImportCandidateSelection.js";
import type { RegisteredSlashCommand, SlashMenuLeaf, SlashMenuSection } from "./types.js";
import { updateResumePreview, type ResumePreviewState } from "./updateResumePreview.js";

const SLASH_MENU_LEFT_PANE_RATIO = 0.42;

/**
 * Two-pane slash navigator with nested Nexus-owned selector flows.
 */
export class SlashMenuModal extends SelectPreviewModal {
  private level: SlashMenuLevel = "top";
  private query = "";
  private topItems = createTopLevelItems();
  private activeLeaves: SlashMenuLeaf[] = [];
  private nameInput = "";
  private pendingSettingLeaf?: SlashMenuLeaf;
  private scopedSelection = new Set<string>();
  private searchActive = false;
  private selectedPreviewItem?: SlashMenuLeaf | SlashMenuSection;
  private readonly previousLevels: SlashMenuLevel[] = [];
  private readonly resumePreviewState: ResumePreviewState = { previewRequestId: 0 };
  private readonly previewCache = new Map<string, string[]>();
  private readonly resumeLeavesCache = new Map<ResumeScope, SlashMenuLeaf[]>();
  private resumeScope: ResumeScope = "current";
  private resourceScope: ResourceCommandScope = "all";
  private pendingImportSource?: AuthImportSource;
  private pendingImportCandidates: AuthImportCandidate[] = [];
  private readonly importSelection = new Set<string>();

  constructor(
    private readonly ctx: ExtensionContext,
    private readonly getThinkingLevel: () => string,
    private readonly setThinkingLevel: (value: string) => void,
    private readonly requestClose: () => void,
    private readonly requestRender: () => void,
    private readonly onCommandPicked: (commandText: string) => void,
    private readonly getCommands: ExtensionAPI["getCommands"] = () => [],
    private readonly ensureModelMenuReady: () => Promise<void> = async () => undefined,
    private readonly onCommandPrefill: (commandText: string) => void = onCommandPicked,
  ) {
    super(ctx.ui.theme, () => undefined, requestClose, undefined, { leftTitle: "Menu", rightTitle: "Preview", bottomTitle: "Search", bottomPrefix: "> /", leftPaneRatio: SLASH_MENU_LEFT_PANE_RATIO, itemMaxLines: (item) => (item as { resumeRow?: boolean }).resumeRow ? 2 : 1 });
    this.setOnPick(() => void this.handleEnter());
  }

  /**
   * Seeds the visible slash query.
   *
   * @param query Current slash query.
   */
  setQuery(query: string): void {
    this.query = query;
    this.searchActive = query.length > 0;
    this.setBottom("Search", query, "> /");
  }

  /**
   * Refreshes the visible list for the current menu level.
   */
  async refresh(selectedValue?: string): Promise<void> {
    this.setFullScreenMode(this.level === "resume");
    this.setPaneVisibility(true, shouldShowSlashMenuPreview(this.level));
    this.setModalWidthPolicy(80, undefined, 0.9);
    if (this.level === "top") {
      this.topItems = createTopLevelItems(this.getDynamicCommands());
      const menuWidth = calculateTopLevelMenuWidth(this.topItems);
      this.setModalWidthPolicy(menuWidth, menuWidth, 0.9);
      this.renderItems(filterMenuItems(this.topItems, this.query), "Menu");
      if (selectedValue) this.selectValue(selectedValue);
      this.requestRender();
      return;
    }
    this.activeLeaves = await this.createVisibleLeaves();
    if (this.level === "settings") {
      const settingsWidth = calculateSettingsMenuWidth(this.activeLeaves);
      this.setModalWidthPolicy(settingsWidth, settingsWidth, 0.9);
    }
    if (this.level === "model") {
      const modelWidth = calculateModelMenuWidth(this.activeLeaves);
      this.setModalWidthPolicy(modelWidth, modelWidth, 0.9);
    }
    if (!shouldShowSlashMenuPreview(this.level) && this.level !== "settings" && this.level !== "model") {
      const menuWidth = calculateSinglePaneMenuWidth(this.activeLeaves, this.level);
      this.setModalWidthPolicy(menuWidth, menuWidth, 0.9);
    }
    this.renderItems(filterMenuItems(this.activeLeaves, this.query), this.level === "setting-choice" ? getSettingChoiceTitle(this.pendingSettingLeaf) : getSlashMenuLevelTitle(this.level));
    if (selectedValue) this.selectValue(selectedValue);
    this.requestRender();
  }

  override handleInput(data: string): void {
    if (this.level === "name-input") {
      this.handleNameInput(data);
      return;
    }
    if (this.handleAuthImportCandidateInput(data)) return;
    if (this.handleResourceScopeInput(data)) return;
    if (this.handleResourcePreviewFocusInput(data)) return;
    if (this.handleResourcePreviewInput(data)) return;
    if (this.handleResumeScopeInput(data)) return;
    handleSlashMenuInput({
      data,
      level: this.level,
      query: this.query,
      scopedSelection: this.scopedSelection,
      setQuery: (query) => { this.query = query; },
      setBottom: (title, value, prefix) => this.setBottom(title, value, prefix),
      refresh: () => { void this.refresh(); },
      handleEscape: () => { void this.handleEscape(); },
      delegateInput: () => super.handleInput(data),
      onCommandPicked: this.onCommandPicked,
    });
  }

  /**
   * Handles provider toggles in the auth import candidate level.
   *
   * @param data Raw keyboard input.
   * @returns True when handled.
   */
  private handleAuthImportCandidateInput(data: string): boolean {
    if (this.level !== "login-import-candidates" || data !== " ") return false;
    const item = this.getSelectedItem();
    if (!item) return true;
    toggleAuthImportCandidateSelection(this.importSelection, item.value);
    void this.refresh(item.value);
    return true;
  }

  /**
   * Moves focus to the resource command markdown preview pane.
   *
   * @param data Raw keyboard input.
   * @returns True when handled.
   */
  private handleResourcePreviewFocusInput(data: string): boolean {
    if ((this.level !== "prompts" && this.level !== "skills") || !matchesKey(data, Key.tab) || this.isRightPaneFocused()) return false;
    this.focusRightPane();
    this.requestRender();
    return true;
  }

  /**
   * Toggles resource command scope filters.
   *
   * @param data Raw keyboard input.
   * @returns True when handled.
   */
  private handleResourceScopeInput(data: string): boolean {
    if (this.level !== "prompts" && this.level !== "skills") return false;
    const scope = selectResourceCommandScopeByKey(data);
    if (!scope) return false;
    this.resourceScope = scope;
    this.query = "";
    this.setBottom("Search", "", "> /");
    void this.refresh();
    return true;
  }

  /**
   * Routes input to a focused resource preview pane.
   *
   * @param data Raw keyboard input.
   * @returns True when handled.
   */
  private handleResourcePreviewInput(data: string): boolean {
    if ((this.level !== "prompts" && this.level !== "skills") || !this.isRightPaneFocused()) return false;
    super.handleInput(data);
    this.requestRender();
    return true;
  }

  /**
   * Creates leaves for the current menu level, reusing cached resume leaves during search.
   *
   * @returns Current level leaves.
   */
  private async createVisibleLeaves(): Promise<SlashMenuLeaf[]> {
    if (this.level === "setting-choice" && this.pendingSettingLeaf) return createSettingChoiceLeaves(this.pendingSettingLeaf);
    if (this.level === "login-import-candidates") return createAuthImportCandidateLeaves(this.pendingImportCandidates, this.importSelection);
    if (this.level === "name-input") return [createNameInputLeaf(this.nameInput)];
    if (this.level === "resume") return getCachedResumeLeaves(this.resumeLeavesCache, this.ctx, this.resumeScope);
    return createActiveLeaves(this.ctx, this.level, this.getThinkingLevel, this.resumeScope, this.getDynamicCommands(), this.resourceScope);
  }

  /**
   * Reads live dynamic slash commands for prompt and skill menus.
   *
   * @returns Normalized dynamic slash commands.
   */
  private getDynamicCommands(): RegisteredSlashCommand[] {
    return getDynamicSlashCommands(this.getCommands);
  }

  private renderItems(items: Array<SlashMenuLeaf | SlashMenuSection>, leftTitle: string): void {
    if (this.level === "resume") this.setTitles(createResumeScopeHeaderTitle(this.resumeScope), "");
    else this.setTitles(leftTitle, this.level === "prompts" || this.level === "skills" ? renderResourceCommandScopeTabs(this.resourceScope, this.ctx.ui.theme) : "Preview");
    this.setHeaderFocusMarkers(this.level !== "prompts" && this.level !== "skills");
    this.setItems(toAutocompleteItems(items.map((item) => this.formatVisibleItem(item))));
    this.selectedPreviewItem = items[0];
    this.resumePreviewState.renderedPreviewKey = undefined;
    this.resumePreviewState.renderedPreviewWidth = undefined;
    this.setRightLines(this.selectedPreviewItem ? this.previewForItem(this.selectedPreviewItem) : ["No matching items."]);
    this.setOnSelectionChange((item) => {
      const selected = items.find((entry) => entry.value === item?.value);
      this.selectedPreviewItem = selected;
      this.resumePreviewState.renderedPreviewKey = undefined;
      this.resumePreviewState.renderedPreviewWidth = undefined;
      this.setRightLines(selected ? this.previewForItem(selected) : ["No matching items."]);
      this.requestRender();
    });
  }

  private async handleEnter(): Promise<void> {
    const item = this.getSelectedItem();
    if (!item) return;
    if (this.level === "top") {
      if (item.value === "hotkeys") return this.openHotkeysPanel();
      if (item.value === "name") return this.openSessionNameInput();
      if (item.value === "session") return this.openSessionInfoPanel();
      if (item.value === "thinking") return this.openSettingChoice(createThinkingSettingLeaf(this.getThinkingLevel(), this.ctx.model));
      const selectedTopItem = this.topItems.find((entry) => entry.value === item.value);
      if (selectedTopItem?.groupLabel === "Custom Commands") {
        this.onCommandPrefill(`/${item.value} `);
        return;
      }
      await handleTopLevelMenuEnter(this.ctx, item.value, (level) => this.openLevel(level), this.onCommandPicked);
      return;
    }
    if (this.level === "settings") {
      if (item.value === "theme") return this.openLevel("theme");
      const leaf = this.activeLeaves.find((entry) => entry.value === item.value);
      if (!leaf) return;
      if ((leaf.options?.length ?? 0) > 0) return this.openSettingChoice(leaf);
      const status = await applySlashMenuLeaf(this.ctx, leaf, this.setThinkingLevel);
      if (status) this.ctx.ui.notify(status, "info");
      await this.refresh(item.value);
      return;
    }
    if (this.level === "setting-choice") return this.applySettingChoice(item.value);
    if (this.level === "theme") return this.applyLeafByValue(item.value);
    if (this.level === "model") {
      if (item.value === "__loading__") return;
      this.onCommandPicked(`/nexus-model-select ${item.value}`);
      return;
    }
    if (this.level === "scoped-models") {
      if (this.scopedSelection.has(item.value)) this.scopedSelection.delete(item.value); else this.scopedSelection.add(item.value);
      await this.refresh(item.value);
      return;
    }
    if (this.level === "fork") return void this.onCommandPicked(`/nexus-fork-select ${item.value}`);
    if (this.level === "resume") return void this.onCommandPicked(`/nexus-resume-select ${encodeSlashMenuValue(item.value)}`);
    if (this.level === "prompts") return void this.onCommandPrefill(`/${item.value} `);
    if (this.level === "skills") return void this.onCommandPicked(`/${item.value}`);
    if ((this.level === "login" || this.level === "login-import") && item.value.startsWith("import:")) {
      return void this.openAuthImportCandidates(item.value.slice("import:".length) as AuthImportSource);
    }
    if (this.level === "login-import-candidates") return void this.importSelectedAuthCandidates();
    if (this.level === "login") return void this.onCommandPicked(`/nexus-login-select ${item.value}`);
    if (this.level === "login-providers") return void this.onCommandPicked(`/nexus-login-select ${item.value}`);
    if (this.level === "logout") return void this.logoutSelectedProvider(item.value);
  }


  /**
   * Opens one slash submenu level.
   *
   * @param level Target slash menu level.
   */
  async openLevel(level: SlashMenuLevel): Promise<void> {
    this.previousLevels.push(this.level);
    if (level === "model") {
      this.level = "model";
      this.query = "";
      this.searchActive = false;
      this.setBottom("Search", "", "> /");
      this.renderItems([createLoadingLeaf("Loading Cursor models…")], "Models");
      this.requestRender();
      await this.ensureModelMenuReady();
      this.ctx.modelRegistry.refresh();
      this.level = resolveRequestedSlashMenuLevel(this.ctx, level);
      await this.refresh();
      return;
    }
    this.level = resolveRequestedSlashMenuLevel(this.ctx, level);
    this.query = "";
    this.searchActive = false;
    if (this.level === "scoped-models") {
      const leaves = createScopedModelLeaves(this.ctx);
      this.scopedSelection = new Set(leaves.filter((leaf) => leaf.label.startsWith("✓")).map((leaf) => leaf.value));
    }
    if (this.level === "resume") {
      this.resumeScope = "current";
      this.resumeLeavesCache.clear();
    }
    if (this.level === "prompts" || this.level === "skills") this.resourceScope = "all";
    this.setBottom("Search", "", "> /");
    await this.refresh();
  }

  /**
   * Opens the provider-candidate selection level for an auth import source.
   *
   * @param source Import source identifier.
   */
  private async openAuthImportCandidates(source: AuthImportSource): Promise<void> {
    const sourceLabel = getAuthImportSourceLabel(source);
    try {
      const { authPath, candidates } = await loadAuthImportCandidates(source, this.ctx.modelRegistry);
      if (candidates.length === 0) {
        this.ctx.ui.notify(`No importable ${sourceLabel} providers found at ${authPath}.`, "info");
        return;
      }
      this.previousLevels.push(this.level);
      this.level = "login-import-candidates";
      this.pendingImportSource = source;
      this.pendingImportCandidates = candidates;
      this.importSelection.clear();
      this.query = "";
      this.searchActive = false;
      this.setBottom("Search", "", "> /");
      await this.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.ctx.ui.notify(`Import from ${sourceLabel} failed: ${message}`, "error");
    }
  }

  /**
   * Imports the selected auth candidates without leaving the slash modal design.
   */
  private async importSelectedAuthCandidates(): Promise<void> {
    if (!this.pendingImportSource) return;
    const selectedCandidates = this.pendingImportCandidates.filter((candidate) => this.importSelection.has(candidate.providerId));
    if (selectedCandidates.length === 0) {
      this.ctx.ui.notify("No providers selected for import", "info");
      return;
    }
    const sourceLabel = getAuthImportSourceLabel(this.pendingImportSource);
    const importedProviderIds = importAuthCandidates(this.ctx.modelRegistry.authStorage, selectedCandidates);
    this.ctx.modelRegistry.refresh();
    this.ctx.ui.notify(`Imported ${importedProviderIds.join(", ")} from ${sourceLabel}`, "info");
    this.pendingImportSource = undefined;
    this.pendingImportCandidates = [];
    this.importSelection.clear();
    this.previousLevels.splice(0, this.previousLevels.length, "top");
    this.level = "login";
    await this.refresh();
  }

  /**
   * Logs out one provider while keeping the slash menu open.
   *
   * @param providerId Provider id to remove from auth storage.
   */
  private async logoutSelectedProvider(providerId: string): Promise<void> {
    logoutProvider(this.ctx, providerId);
    this.ctx.ui.notify(`Logged out of ${providerId}`, "info");
    await this.refresh();
  }

  private async applyLeafByValue(value: string): Promise<void> {
    const leaf = this.activeLeaves.find((entry) => entry.value === value);
    if (!leaf) return;
    const status = await applySlashMenuLeaf(this.ctx, leaf, this.setThinkingLevel);
    if (status) this.ctx.ui.notify(status, "info");
    await this.refresh(value);
  }

  private async openHotkeysPanel(): Promise<void> {
    this.requestClose();
    await this.ctx.ui.custom<void>((_tui, theme, keybindings, done) => new HotkeysModal(theme, keybindings as never, getRegisteredHotkeysShortcuts(), done), {
      overlay: true,
      overlayOptions: createPanelOverlayOptions(92, "100%") as never,
    });
  }

  private async openSessionNameInput(): Promise<void> {
    this.previousLevels.push(this.level);
    this.level = "name-input";
    this.query = "";
    this.searchActive = false;
    this.nameInput = (this.ctx.sessionManager as { getSessionName?: () => string | undefined }).getSessionName?.() ?? "";
    this.setBottom("Name", this.nameInput, "> ");
    await this.refresh();
  }

  private handleNameInput(data: string): void {
    if (matchesKey(data, Key.escape)) {
      void this.handleEscape();
      return;
    }
    if (matchesKey(data, Key.enter)) {
      this.onCommandPicked(`/name ${sanitizeSessionNameInput(this.nameInput)}`);
      return;
    }
    if (data === "\u007f" || matchesKey(data, Key.backspace)) {
      this.nameInput = this.nameInput.slice(0, -1);
      this.setBottom("Name", this.nameInput, "> ");
      void this.refresh();
      return;
    }
    if (!isSlashTextInput(data) && data !== " ") return;
    this.nameInput = `${this.nameInput}${data}`;
    this.setBottom("Name", this.nameInput, "> ");
    void this.refresh();
  }

  /**
   * Opens the Nexus-owned current session info panel.
   */
  private async openSessionInfoPanel(): Promise<void> {
    this.requestClose();
    await showSessionInfoModal(this.ctx);
  }

  /**
   * Handles resume-source switching shortcuts.
   *
   * @param data Raw keyboard input.
   * @returns True when the key switched resume source.
   */
  private handleResumeScopeInput(data: string): boolean {
    if (this.level !== "resume") return false;
    if (data === "\t") {
      void this.setResumeScope(getNextResumeScope(this.resumeScope));
      return true;
    }
    if (matchesKey(data, Key.left)) {
      void this.setResumeScope("current");
      return true;
    }
    if (matchesKey(data, Key.right)) {
      void this.setResumeScope("all");
      return true;
    }
    return false;
  }

  /**
   * Sets the resume source and refreshes the resume menu.
   *
   * @param scope Source to display.
   */
  private async setResumeScope(scope: ResumeScope): Promise<void> {
    if (this.resumeScope === scope) return;
    this.resumeScope = scope;
    this.query = "";
    this.searchActive = false;
    this.setBottom("Search", "", "> /");
    await this.refresh();
  }

  private async openSettingChoice(leaf: SlashMenuLeaf): Promise<void> {
    this.pendingSettingLeaf = leaf;
    await this.openLevel("setting-choice");
    if (leaf.currentValue) this.selectValue(leaf.currentValue);
  }

  private async applySettingChoice(value: string): Promise<void> {
    if (!this.pendingSettingLeaf) return;
    const settingValue = this.pendingSettingLeaf.value;
    const status = applySlashMenuSettingValue(this.ctx, this.pendingSettingLeaf, value, this.setThinkingLevel);
    if (status) this.ctx.ui.notify(status, "info");
    this.level = this.previousLevels.pop() ?? "settings";
    this.query = "";
    this.searchActive = false;
    this.setBottom("Search", "", "> /");
    await this.refresh(settingValue);
  }

  private async handleEscape(): Promise<void> {
    if (this.level === "top") {
      this.requestClose();
      return;
    }
    this.level = this.previousLevels.pop() ?? "top";
    this.query = "";
    this.searchActive = false;
    this.setBottom("Search", "", "> /");
    await this.refresh();
  }

  override render(width: number): string[] {
    this.setFooterHintLines(this.createFooterHintLines());
    const item = this.selectedPreviewItem;
    if (this.level === "resume" && item) {
      updateResumePreview({
        width,
        ctx: this.ctx,
        item,
        state: this.resumePreviewState,
        previewCache: this.previewCache,
        isRightPaneFocused: () => this.isRightPaneFocused(),
        leftPaneRatio: SLASH_MENU_LEFT_PANE_RATIO,
        setRightLines: (lines) => this.setRightLines(lines),
        requestRender: this.requestRender,
        isStillSelected: (previewItem) => this.selectedPreviewItem?.value === previewItem.value,
      });
    }
    return super.render(width);
  }

  /**
   * Creates helper footer lines for the current menu state.
   *
   * @returns Helper footer lines.
   */
  private createFooterHintLines(): string[] {
    if (this.level === "prompts" || this.level === "skills") return [createResourceCommandFooterHint(this.ctx.ui.theme, this.isRightPaneFocused())];
    return [];
  }

  private previewForItem(item: SlashMenuLeaf | SlashMenuSection): string[] {
    return createSlashMenuPreviewLines(this.level, item, this.ctx.ui.theme);
  }

  private formatVisibleItem(item: SlashMenuLeaf | SlashMenuSection): SlashMenuLeaf | SlashMenuSection {
    const icon = getSlashMenuItemIcon(item, this.level);
    if (this.level === "top") return { ...item, label: formatTopLevelMenuLabel(item.label, item.description, this.ctx.ui.theme, icon), description: "", preserveLabelWhitespace: true };
    if (this.level === "settings") return { ...item, label: formatSettingsMenuLabel(item.label, (item as SlashMenuLeaf).currentValue, this.ctx.ui.theme, icon), description: "", preserveLabelWhitespace: true };
    if (this.level === "setting-choice") return { ...item, description: "" };
    if (this.level === "resume") return { ...item, label: `${item.label}\n${item.description}`, description: "", preserveLabelWhitespace: true, resumeRow: true, wrapPreservedLabel: true };
    if ((this.level === "login" || this.level === "login-providers") && !item.value.startsWith("import:")) return { ...item, label: formatLoginProviderLabel(item as SlashMenuLeaf, icon, this.ctx.ui.theme), description: "" };
    if (this.level === "model" || this.level === "login" || this.level === "login-import" || this.level === "login-import-candidates" || this.level === "login-providers" || this.level === "logout" || this.level === "theme" || this.level === "scoped-models" || this.level === "name-input") return { ...item, label: `${icon} ${item.label}`, description: "" };
    if (this.level === "prompts" || this.level === "skills") return { ...item, label: formatResourceCommandLabel(icon, item as SlashMenuLeaf), description: "", wrapToFit: this.level === "skills" };
    return { ...item, label: `${icon} ${item.label}` };
  }

}
