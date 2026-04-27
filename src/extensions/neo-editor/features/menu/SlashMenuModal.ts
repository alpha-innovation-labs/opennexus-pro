import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { TwoPaneSelectModal } from "../../../shared/two-pane-select-modal/index.js";
import { applySlashMenuLeaf } from "./applySlashMenuLeaf.js";
import { createActiveLeaves } from "./createActiveLeaves.js";
import { createScopedModelLeaves } from "./createScopedModelLeaves.js";
import { createSlashMenuPreviewLines } from "./createSlashMenuPreviewLines.js";
import { createTopLevelItems } from "./createTopLevelItems.js";
import { encodeSlashMenuValue } from "./encodeSlashMenuValue.js";
import { filterMenuItems } from "./filterMenuItems.js";
import { getSlashMenuLevelTitle } from "./getSlashMenuLevelTitle.js";
import { handleSlashMenuInput } from "./handleSlashMenuInput.js";
import { handleTopLevelMenuEnter } from "./handleTopLevelMenuEnter.js";
import type { SlashMenuLevel } from "./SlashMenuLevel.js";
import { toAutocompleteItems } from "./toAutocompleteItems.js";
import type { SlashMenuLeaf, SlashMenuSection } from "./types.js";
import { updateResumePreview, type ResumePreviewState } from "./updateResumePreview.js";

/**
 * Two-pane slash navigator with nested Nexus-owned selector flows.
 */
export class SlashMenuModal extends TwoPaneSelectModal {
  private level: SlashMenuLevel = "top";
  private query = "";
  private topItems = createTopLevelItems();
  private activeLeaves: SlashMenuLeaf[] = [];
  private pendingTreeEntryId = "";
  private scopedSelection = new Set<string>();
  private selectedPreviewItem?: SlashMenuLeaf | SlashMenuSection;
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
    this.setBottom("Search", query, "> /");
  }

  /**
   * Refreshes the visible list for the current menu level.
   */
  async refresh(): Promise<void> {
    if (this.level === "top") {
      this.topItems = createTopLevelItems();
      this.renderItems(filterMenuItems(this.topItems, this.query), "Menu");
      this.requestRender();
      return;
    }
    this.activeLeaves = await createActiveLeaves(this.ctx, this.level, this.getThinkingLevel);
    this.renderItems(filterMenuItems(this.activeLeaves, this.query), getSlashMenuLevelTitle(this.level));
    this.requestRender();
  }

  override handleInput(data: string): void {
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

  private renderItems(items: Array<SlashMenuLeaf | SlashMenuSection>, leftTitle: string): void {
    this.setTitles(leftTitle, "Preview");
    this.setItems(toAutocompleteItems(items.map((item) => this.level === "settings" ? { ...item, label: `${item.label}  ${(item as SlashMenuLeaf).currentValue ?? ""}` } : item)));
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
      await handleTopLevelMenuEnter(this.ctx, item.value, (level) => this.openLevel(level), this.onCommandPicked);
      return;
    }
    if (this.level === "settings") {
      if (item.value === "theme") return this.openLevel("theme");
      const leaf = this.activeLeaves.find((entry) => entry.value === item.value);
      if (!leaf) return;
      const status = await applySlashMenuLeaf(this.ctx, leaf, this.setThinkingLevel);
      if (status) this.ctx.ui.notify(status, "info");
      await this.refresh();
      return;
    }
    if (this.level === "theme") return this.applyLeafByValue(item.value);
    if (this.level === "model") {
      this.onCommandPicked(`/nexus-model-select ${item.value}`);
      return;
    }
    if (this.level === "scoped-models") {
      if (this.scopedSelection.has(item.value)) this.scopedSelection.delete(item.value); else this.scopedSelection.add(item.value);
      await this.refresh();
      return;
    }
    if (this.level === "fork") return void this.onCommandPicked(`/nexus-fork-select ${item.value}`);
    if (this.level === "tree") {
      this.pendingTreeEntryId = item.value;
      return this.openLevel("tree-summary");
    }
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
    this.level = level;
    this.query = "";
    if (level === "scoped-models") {
      const leaves = createScopedModelLeaves(this.ctx);
      this.scopedSelection = new Set(leaves.filter((leaf) => leaf.label.startsWith("✓")).map((leaf) => leaf.value));
    }
    this.setBottom("Search", "", "> /");
    await this.refresh();
  }

  private async applyLeafByValue(value: string): Promise<void> {
    const leaf = this.activeLeaves.find((entry) => entry.value === value);
    if (!leaf) return;
    const status = await applySlashMenuLeaf(this.ctx, leaf, this.setThinkingLevel);
    if (status) this.ctx.ui.notify(status, "info");
    await this.refresh();
  }

  private async handleEscape(): Promise<void> {
    if (this.level === "top") {
      this.requestClose();
      return;
    }
    this.level = this.level === "theme" ? "settings" : this.level === "tree-summary" ? "tree" : "top";
    this.query = "";
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
}
