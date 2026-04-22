import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Key, matchesKey } from "@mariozechner/pi-tui";
import { SessionManager } from "../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/session-manager.js";
import { TwoPaneSelectModal } from "../two-pane-select-modal/index.js";
import { applySlashMenuLeaf } from "./applySlashMenuLeaf.js";
import { createForkLeaves } from "./createForkLeaves.js";
import { createLeafPreviewLines } from "./createLeafPreviewLines.js";
import { createModelLeaves } from "./createModelLeaves.js";
import { createOAuthProviderLeaves } from "./createOAuthProviderLeaves.js";
import { createResumeLeaves } from "./createResumeLeaves.js";
import { createScopedModelLeaves } from "./createScopedModelLeaves.js";
import { createSettingsLeaves } from "./createSettingsLeaves.js";
import { createThemeLeaves } from "./createThemeLeaves.js";
import { createTopLevelItems } from "./createTopLevelItems.js";
import { createTreeLeaves } from "./createTreeLeaves.js";
import { createTreeSummaryLeaves } from "./createTreeSummaryLeaves.js";
import { encodeSlashMenuValue } from "./encodeSlashMenuValue.js";
import { filterMenuItems } from "./filterMenuItems.js";
import { findTopLevelItem } from "./findTopLevelItem.js";
import { getSettingsRootLeaf } from "./getSettingsRootLeaf.js";
import { isSlashTextInput } from "./isSlashTextInput.js";
import { toAutocompleteItems } from "./toAutocompleteItems.js";
import type { SlashMenuLeaf, SlashMenuSection } from "./types.js";

type SlashMenuLevel = "top" | "settings" | "theme" | "model" | "scoped-models" | "fork" | "tree" | "tree-summary" | "resume" | "login" | "logout";

/**
 * Two-pane slash navigator with nested Nexus-owned selector flows.
 */
export class SlashMenuModal extends TwoPaneSelectModal {
  private level: SlashMenuLevel = "top";
  private query = "";
  private topItems = createTopLevelItems();
  private settingsLeaves: SlashMenuLeaf[] = [];
  private themeLeaves: SlashMenuLeaf[] = [];
  private activeLeaves: SlashMenuLeaf[] = [];
  private pendingTreeEntryId = "";
  private scopedSelection = new Set<string>();

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
    if (this.level === "settings") this.activeLeaves = await createSettingsLeaves(this.ctx.cwd, this.getThinkingLevel(), this.ctx.model);
    else if (this.level === "theme") this.activeLeaves = await createThemeLeaves(this.ctx.cwd);
    else if (this.level === "model") this.activeLeaves = createModelLeaves(this.ctx);
    else if (this.level === "scoped-models") this.activeLeaves = createScopedModelLeaves(this.ctx);
    else if (this.level === "fork") this.activeLeaves = createForkLeaves(this.ctx.sessionManager.getEntries() as never);
    else if (this.level === "tree") this.activeLeaves = createTreeLeaves(this.ctx.sessionManager.getTree() as never);
    else if (this.level === "tree-summary") this.activeLeaves = createTreeSummaryLeaves();
    else if (this.level === "resume") this.activeLeaves = createResumeLeaves(await SessionManager.list(this.ctx.cwd, this.ctx.sessionManager.getSessionDir()));
    else if (this.level === "login") this.activeLeaves = createOAuthProviderLeaves(this.ctx, "login");
    else if (this.level === "logout") this.activeLeaves = createOAuthProviderLeaves(this.ctx, "logout");
    this.renderItems(filterMenuItems(this.activeLeaves, this.query), this.getLevelTitle());
    this.requestRender();
  }

  override handleInput(data: string): void {
    if (matchesKey(data, Key.ctrl("c"))) {
      super.handleInput(data);
      return;
    }
    if (matchesKey(data, Key.escape)) {
      void this.handleEscape();
      return;
    }
    if (matchesKey(data, Key.enter) || matchesKey(data, Key.up) || matchesKey(data, Key.down) || matchesKey(data, Key.ctrl("n")) || matchesKey(data, Key.ctrl("p"))) {
      super.handleInput(data);
      return;
    }
    if (this.level === "scoped-models" && (data === "s" || matchesKey(data, Key.ctrl("s")))) {
      this.onCommandPicked(`/nexus-scoped-models-save ${encodeSlashMenuValue([...this.scopedSelection].join("\n"))}`);
      return;
    }
    if (data === "\u007f" || matchesKey(data, Key.backspace)) {
      this.query = this.query.slice(0, -1);
      this.setBottom("Search", this.query, "> /");
      void this.refresh();
      return;
    }
    if (isSlashTextInput(data)) {
      this.query += data;
      this.setBottom("Search", this.query, "> /");
      void this.refresh();
    }
  }

  private renderItems(items: Array<SlashMenuLeaf | SlashMenuSection>, leftTitle: string): void {
    this.setTitles(leftTitle, "Preview");
    this.setItems(toAutocompleteItems(items.map((item) => this.level === "settings" ? { ...item, label: `${item.label}  ${(item as SlashMenuLeaf).currentValue ?? ""}` } : item)));
    const first = items[0];
    this.setRightLines(first ? this.previewForItem(first) : ["No matching items."]);
    this.setOnSelectionChange((item) => {
      const selected = items.find((entry) => entry.value === item?.value);
      this.setRightLines(selected ? this.previewForItem(selected) : ["No matching items."]);
    });
  }

  private async handleEnter(): Promise<void> {
    const item = this.getSelectedItem();
    if (!item) return;
    if (this.level === "top") {
      await this.handleTopLevelEnter(item.value);
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

  private async handleTopLevelEnter(value: string): Promise<void> {
    if (value === "settings") return this.openLevel("settings");
    if (value === "model") return this.openLevel("model");
    if (value === "scoped-models") return this.openLevel("scoped-models");
    if (value === "fork") {
      const leaves = createForkLeaves(this.ctx.sessionManager.getEntries() as never);
      if (leaves.length === 0) {
        this.ctx.ui.notify("No messages to fork from", "info");
        return;
      }
      return this.openLevel("fork");
    }
    if (value === "tree") {
      const leaves = createTreeLeaves(this.ctx.sessionManager.getTree() as never);
      if (leaves.length === 0) {
        this.ctx.ui.notify("No entries in session", "info");
        return;
      }
      return this.openLevel("tree");
    }
    if (value === "resume") return this.openLevel("resume");
    if (value === "login") return this.openLevel("login");
    if (value === "logout") {
      const leaves = createOAuthProviderLeaves(this.ctx, "logout");
      if (leaves.length === 0) {
        this.ctx.ui.notify("No OAuth providers logged in. Use /login first.", "info");
        return;
      }
      return this.openLevel("logout");
    }
    this.onCommandPicked(`/${value}`);
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

  private getLevelTitle(): string {
    return this.level === "scoped-models" ? "Scoped Models" : this.level.charAt(0).toUpperCase() + this.level.slice(1);
  }

  private previewForItem(item: SlashMenuLeaf | SlashMenuSection): string[] {
    if (item.value === "settings") return createLeafPreviewLines(getSettingsRootLeaf());
    const leaf = findTopLevelItem(item.value) as SlashMenuLeaf | undefined;
    return createLeafPreviewLines((leaf ?? item) as SlashMenuLeaf);
  }
}
