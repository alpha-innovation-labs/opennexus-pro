import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Key, matchesKey } from "@mariozechner/pi-tui";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";
import { createPanelOverlayOptions } from "../../../overlay/createPanelOverlayOptions.js";
import { HelpShortcutsModal } from "../help-shortcuts/HelpShortcutsModal.js";
import { applySlashMenuLeaf } from "./applySlashMenuLeaf.js";
import { applySlashMenuSettingValue } from "./applySlashMenuSettingValue.js";
import { calculateModelMenuWidth } from "./calculateModelMenuWidth.js";
import { calculateSettingsMenuWidth } from "./calculateSettingsMenuWidth.js";
import { calculateSinglePaneMenuWidth } from "./calculateSinglePaneMenuWidth.js";
import { calculateTopLevelMenuWidth } from "./calculateTopLevelMenuWidth.js";
import { createActiveLeaves } from "./createActiveLeaves.js";
import { createNameInputLeaf } from "./createNameInputLeaf.js";
import { createScopedModelLeaves } from "./createScopedModelLeaves.js";
import { createSettingChoiceLeaves } from "./createSettingChoiceLeaves.js";
import { createSlashMenuPreviewLines } from "./createSlashMenuPreviewLines.js";
import { createTopLevelItems } from "./createTopLevelItems.js";
import { encodeSlashMenuValue } from "./encodeSlashMenuValue.js";
import { filterMenuItems } from "./filterMenuItems.js";
import { formatSettingsMenuLabel } from "./formatSettingsMenuLabel.js";
import { formatTopLevelMenuLabel } from "./formatTopLevelMenuLabel.js";
import { getSettingChoiceTitle } from "./getSettingChoiceTitle.js";
import { getSlashMenuItemIcon } from "./getSlashMenuItemIcon.js";
import { getSlashMenuLevelTitle } from "./getSlashMenuLevelTitle.js";
import { getTreeToggleUserId } from "./tree/getTreeToggleUserId.js";
import { handleSlashMenuInput } from "./handleSlashMenuInput.js";
import { showSessionInfoModal } from "./session-info/showSessionInfoModal.js";
import { handleTopLevelMenuEnter } from "./handleTopLevelMenuEnter.js";
import { isSlashTextInput } from "./isSlashTextInput.js";
import { sanitizeSessionNameInput } from "./sanitizeSessionNameInput.js";
import { shouldShowSlashMenuPreview } from "./shouldShowSlashMenuPreview.js";
import { resolveRequestedSlashMenuLevel } from "./resolveRequestedSlashMenuLevel.js";
import type { SlashMenuLevel } from "./SlashMenuLevel.js";
import { toAutocompleteItems } from "./toAutocompleteItems.js";
import type { SlashMenuLeaf, SlashMenuSection } from "./types.js";
import { updateResumePreview, type ResumePreviewState } from "./updateResumePreview.js";

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
  private pendingTreeEntryId = "";
  private scopedSelection = new Set<string>();
  private searchActive = false;
  private readonly expandedTreeUserIds = new Set<string>();
  private selectedPreviewItem?: SlashMenuLeaf | SlashMenuSection;
  private readonly previousLevels: SlashMenuLevel[] = [];
  private readonly resumePreviewState: ResumePreviewState = { previewRequestId: 0 };
  private readonly previewCache = new Map<string, string[]>();

  constructor(
    private readonly ctx: ExtensionContext,
    private readonly getThinkingLevel: () => string,
    private readonly setThinkingLevel: (value: string) => void,
    private readonly requestClose: () => void,
    private readonly requestRender: () => void,
    private readonly onCommandPicked: (commandText: string) => void,
  ) {
    super(ctx.ui.theme, () => undefined, requestClose, undefined, { leftTitle: "Menu", rightTitle: "Preview", bottomTitle: "Search", bottomPrefix: "> /", leftPaneRatio: 0.42 });
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
    this.setPaneVisibility(true, shouldShowSlashMenuPreview(this.level));
    this.setModalWidthPolicy(80, undefined, 0.9);
    if (this.level === "top") {
      this.topItems = createTopLevelItems();
      const menuWidth = calculateTopLevelMenuWidth(this.topItems);
      this.setModalWidthPolicy(menuWidth, menuWidth, 0.9);
      this.renderItems(filterMenuItems(this.topItems, this.query), "Menu");
      if (selectedValue) this.selectValue(selectedValue);
      this.requestRender();
      return;
    }
    this.activeLeaves = this.level === "setting-choice" && this.pendingSettingLeaf ? createSettingChoiceLeaves(this.pendingSettingLeaf) : this.level === "name-input" ? [createNameInputLeaf(this.nameInput)] : await createActiveLeaves(this.ctx, this.level, this.getThinkingLevel, this.expandedTreeUserIds);
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
    if (this.handleTreeNavigationInput(data)) return;
    if (this.handleTreeSearchActivationInput(data)) return;
    if (this.isTreeSearchInactive() && this.handleListNavigationInput(data)) return;
    if (this.isTreeSearchInactive() && (isSlashTextInput(data) || data === "\u007f" || matchesKey(data, Key.backspace))) return;
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
   * Handles tree-specific focus and expansion shortcuts before search input.
   *
   * @param data Raw keyboard input.
   * @returns True when handled.
   */
  private handleTreeNavigationInput(data: string): boolean {
    if (this.level !== "tree" || this.searchActive) return false;
    if (matchesKey(data, Key.enter)) {
      this.focusSelectedTreeItem();
      return true;
    }
    if (data === "l" || matchesKey(data, Key.right)) {
      void this.setSelectedTreeExpanded(true);
      return true;
    }
    if (data === "h" || matchesKey(data, Key.left)) {
      void this.setSelectedTreeExpanded(false);
      return true;
    }
    return false;
  }

  /**
   * Activates tree-only slash-menu search mode.
   *
   * @param data Raw keyboard input.
   * @returns True when handled.
   */
  private handleTreeSearchActivationInput(data: string): boolean {
    if (this.level !== "tree" || this.searchActive || data !== "/") return false;
    this.searchActive = true;
    this.query = "";
    this.setBottom("Search", "", "> /");
    this.requestRender();
    return true;
  }

  /**
   * Returns whether tree search is inactive and printable keys should be ignored.
   *
   * @returns True when tree search has not been activated.
   */
  private isTreeSearchInactive(): boolean {
    return this.level === "tree" && !this.searchActive;
  }

  /**
   * Routes non-search list navigation keys to the select list.
   *
   * @param data Raw keyboard input.
   * @returns True when handled.
   */
  private handleListNavigationInput(data: string): boolean {
    if (data === "j" || data === "k" || data === "g" || data === "G" || matchesKey(data, Key.up) || matchesKey(data, Key.down) || matchesKey(data, Key.ctrl("n")) || matchesKey(data, Key.ctrl("p"))) {
      super.handleInput(data);
      return true;
    }
    return false;
  }

  private renderItems(items: Array<SlashMenuLeaf | SlashMenuSection>, leftTitle: string): void {
    this.setTitles(leftTitle, "Preview");
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
      this.onCommandPicked(`/nexus-model-select ${item.value}`);
      return;
    }
    if (this.level === "scoped-models") {
      if (this.scopedSelection.has(item.value)) this.scopedSelection.delete(item.value); else this.scopedSelection.add(item.value);
      await this.refresh(item.value);
      return;
    }
    if (this.level === "fork") return void this.onCommandPicked(`/nexus-fork-select ${item.value}`);
    if (this.level === "tree") return void this.focusSelectedTreeItem();
    if (this.level === "tree-summary") {
      const encodedInstructions = item.value === "custom-summary" ? ` ${encodeSlashMenuValue(await this.ctx.ui.editor("Custom summarization instructions") ?? "")}` : "";
      this.onCommandPicked(`/nexus-tree-select ${this.pendingTreeEntryId} ${String(item.value !== "nosummary")}${encodedInstructions}`);
      return;
    }
    if (this.level === "resume") return void this.onCommandPicked(`/nexus-resume-select ${encodeSlashMenuValue(item.value)}`);
    if (this.level === "login") return void this.onCommandPicked(`/nexus-login-select ${item.value}`);
    if (this.level === "logout") return void this.onCommandPicked(`/nexus-logout-select ${item.value}`);
  }


  /**
   * Opens one slash submenu level.
   *
   * @param level Target slash menu level.
   */
  async openLevel(level: SlashMenuLevel): Promise<void> {
    this.previousLevels.push(this.level);
    this.level = resolveRequestedSlashMenuLevel(this.ctx, level);
    this.query = "";
    this.searchActive = false;
    if (this.level === "scoped-models") {
      const leaves = createScopedModelLeaves(this.ctx);
      this.scopedSelection = new Set(leaves.filter((leaf) => leaf.label.startsWith("✓")).map((leaf) => leaf.value));
    }
    if (this.level === "tree") this.expandedTreeUserIds.clear();
    this.setBottom("Search", "", "> /");
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
    await this.ctx.ui.custom<void>((_tui, theme, _keybindings, done) => new HelpShortcutsModal(theme, done), {
      overlay: true,
      overlayOptions: createPanelOverlayOptions(80),
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
    this.previousLevels.pop();
    this.level = "settings";
    this.query = "";
    this.searchActive = false;
    this.setBottom("Search", "", "> /");
    await this.refresh(settingValue);
  }

  /**
   * Focuses the currently selected tree row.
   */
  private focusSelectedTreeItem(): void {
    const selected = this.getSelectedItem() as ({ value: string; treeFocusEntryId?: string } | null);
    if (!selected) return;
    const leaf = this.activeLeaves.find((entry) => entry.value === selected.value);
    const focusEntryId = leaf?.treeFocusEntryId ?? selected.treeFocusEntryId ?? selected.value;
    this.onCommandPicked(`/nexus-tree-select ${focusEntryId} false`);
  }

  /**
   * Sets tree children visibility for the selected conversation row.
   *
   * @param expanded Whether children should be visible.
   */
  private async setSelectedTreeExpanded(expanded: boolean): Promise<void> {
    const selected = this.getSelectedItem() as ({ value: string; treeParentUserId?: string } | null);
    const leaf = this.activeLeaves.find((entry) => entry.value === selected?.value);
    const userId = getTreeToggleUserId(leaf) ?? selected?.treeParentUserId;
    if (!userId) return;
    if (expanded) this.expandedTreeUserIds.add(userId); else this.expandedTreeUserIds.delete(userId);
    await this.refresh(userId);
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
    const item = this.selectedPreviewItem;
    if (this.level === "resume" && item) {
      updateResumePreview({
        width,
        ctx: this.ctx,
        item,
        state: this.resumePreviewState,
        previewCache: this.previewCache,
        isRightPaneFocused: () => this.isRightPaneFocused(),
        setRightLines: (lines) => this.setRightLines(lines),
        requestRender: this.requestRender,
        isStillSelected: (previewItem) => this.selectedPreviewItem?.value === previewItem.value,
      });
    }
    return super.render(width);
  }

  private previewForItem(item: SlashMenuLeaf | SlashMenuSection): string[] {
    return createSlashMenuPreviewLines(this.level, item);
  }

  private formatVisibleItem(item: SlashMenuLeaf | SlashMenuSection): SlashMenuLeaf | SlashMenuSection {
    const icon = getSlashMenuItemIcon(item, this.level);
    if (this.level === "top") return { ...item, label: formatTopLevelMenuLabel(item.label, item.description, this.ctx.ui.theme, icon), description: "", preserveLabelWhitespace: true };
    if (this.level === "settings") return { ...item, label: formatSettingsMenuLabel(item.label, (item as SlashMenuLeaf).currentValue, this.ctx.ui.theme, icon), description: "", preserveLabelWhitespace: true };
    if (this.level === "setting-choice") return { ...item, description: "" };
    if (this.level === "tree") return { ...item, description: "", preserveLabelWhitespace: true };
    if (this.level === "model" || this.level === "login" || this.level === "logout" || this.level === "theme" || this.level === "scoped-models" || this.level === "name-input") return { ...item, label: `${icon} ${item.label}`, description: "" };
    return { ...item, label: `${icon} ${item.label}` };
  }
}
