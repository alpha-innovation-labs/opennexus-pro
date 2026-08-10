import { Key, matchesKey } from "@earendil-works/pi-tui";
import { SharedModal, type SharedModalTheme } from "@nexus/tui-kit/modal/index";
import type { OpenRouterModelOption } from "../pricing/OpenRouterModelOption";
import type { RtkGainReport } from "../savings/RtkGainReport";
import type { SavingsReport } from "../savings/SavingsReport";
import type { RtkSavingsPeriodKey } from "../savings/RtkSavingsPeriodKey";
import { createRtkSavingsHeaderLine } from "../savings/createRtkSavingsHeaderLine";
import { createRtkSavingsLines } from "../savings/createRtkSavingsLines";
import { getNextRtkSavingsPeriod } from "../savings/getNextRtkSavingsPeriod";
import { getRtkSavingsModalInnerWidth } from "./getRtkSavingsModalInnerWidth";
import {
  RTK_SAVINGS_MODAL_MAX_WIDTH,
  RTK_SAVINGS_MODAL_MAX_WIDTH_RATIO,
  RTK_SAVINGS_MODAL_MIN_WIDTH,
} from "./rtkSavingsModalLayout";

/**
 * Modal that displays RTK token savings.
 */
export class RtkSavingsModal extends SharedModal {
  private readonly onRenderNeeded: () => void;
  private modelFilterQuery = "";
  private modelPanelOpen = false;
  private modelSelectionIndex = 0;
  private report: RtkGainReport | SavingsReport;
  private selectedPeriod: RtkSavingsPeriodKey = "daily";

  /**
   * Creates the RTK savings modal.
   *
   * @param theme Active UI theme.
   * @param report Parsed RTK gain report.
   * @param onClose Close callback.
   * @param onRenderNeeded Render request callback.
   */
  constructor(theme: SharedModalTheme, report: RtkGainReport | SavingsReport, onClose: () => void, onRenderNeeded: () => void = () => undefined) {
    super({
      headerLines: [theme.fg("accent", "Token Savings")],
      maxWidth: RTK_SAVINGS_MODAL_MAX_WIDTH,
      maxWidthRatio: RTK_SAVINGS_MODAL_MAX_WIDTH_RATIO,
      minWidth: RTK_SAVINGS_MODAL_MIN_WIDTH,
      onClose,
      panes: [{ id: "savings", lines: createRtkSavingsLines(report, theme, "daily"), size: 1 }],
      theme,
    });
    this.onRenderNeeded = onRenderNeeded;
    this.report = report;
  }

  /**
   * Handles period selector tab navigation.
   *
   * @param data Raw keyboard input.
   */
  override handleInput(data: string): void {
    if (this.modelPanelOpen && this.handleModelPanelInput(data)) return;

    if (data === "m") {
      this.openModelPanel();
      return;
    }

    if (matchesKey(data, Key.tab)) {
      this.selectPeriod(1);
      return;
    }

    if (matchesKey(data, Key.shift("tab"))) {
      this.selectPeriod(-1);
      return;
    }

    super.handleInput(data);
  }

  /**
   * Renders the modal after aligning the header selector to the right edge.
   *
   * @param width Available terminal width.
   * @returns Rendered modal lines.
   */
  override render(width: number): string[] {
    this.headerLines = [createRtkSavingsHeaderLine(this.theme, this.selectedPeriod, getRtkSavingsModalInnerWidth(width))];
    return super.render(width);
  }

  /**
   * Selects the next or previous period.
   *
   * @param direction Selection direction.
   */
  private selectPeriod(direction: 1 | -1): void {
    this.selectedPeriod = getNextRtkSavingsPeriod(this.selectedPeriod, direction);
    this.refreshSavingsLines();
  }

  /**
   * Opens the pricing model selector panel.
   */
  private openModelPanel(): void {
    const models = this.getAvailableModels();
    if (models.length === 0) return;
    this.modelPanelOpen = true;
    this.modelFilterQuery = "";
    this.modelSelectionIndex = Math.max(0, models.findIndex((model) => model.id === this.getSelectedPricingModelId()));
    this.refreshModelPanelLines();
  }

  /**
   * Handles keyboard input while the model selector is open.
   *
   * @param data Raw keyboard input.
   * @returns True when input was handled.
   */
  private handleModelPanelInput(data: string): boolean {
    if (matchesKey(data, Key.escape)) return this.closeModelPanel();
    if (data === "j" || matchesKey(data, Key.down)) return this.moveModelSelection(1);
    if (data === "k" || matchesKey(data, Key.up)) return this.moveModelSelection(-1);
    if (matchesKey(data, Key.enter)) return this.selectPricingModel();
    if (this.handleModelFilterInput(data)) return true;
    return false;
  }

  /**
   * Closes the pricing model selector panel.
   *
   * @returns Always true.
   */
  private closeModelPanel(): true {
    this.modelPanelOpen = false;
    this.modelFilterQuery = "";
    this.footerLines = [];
    this.refreshSavingsLines();
    return true;
  }

  /**
   * Moves the selected model row.
   *
   * @param direction Selection direction.
   * @returns Always true.
   */
  private moveModelSelection(direction: 1 | -1): true {
    const models = this.getFilteredModels();
    this.modelSelectionIndex = Math.max(0, Math.min(models.length - 1, this.modelSelectionIndex + direction));
    this.refreshModelPanelLines();
    return true;
  }

  /**
   * Selects the highlighted pricing model and refreshes pricing.
   *
   * @returns Always true.
   */
  private selectPricingModel(): true {
    const model = this.getFilteredModels()[this.modelSelectionIndex];
    if (!model || !("rtk" in this.report)) return true;
    this.report = { ...this.report, pricing: model.pricing, pricingModelId: model.id };
    this.closeModelPanel();
    return true;
  }

  /**
   * Refreshes the regular savings panel lines.
   */
  private refreshSavingsLines(): void {
    this.footerLines = [];
    this.panes = [{ id: "savings", lines: createRtkSavingsLines(this.report, this.theme, this.selectedPeriod), size: 1 }];
    this.onRenderNeeded();
  }

  /**
   * Refreshes the model selector panel lines.
   */
  private refreshModelPanelLines(): void {
    this.footerLines = [this.theme.fg("dim", `Filter: ${this.modelFilterQuery || "type to filter"} · Enter select · Esc back`)];
    this.panes = [{ id: "models", lines: this.createModelPanelLines(), size: 1 }];
    this.onRenderNeeded();
  }

  /**
   * Creates the model selector panel lines.
   *
   * @returns Model selector lines.
   */
  private createModelPanelLines(): string[] {
    const selectedId = this.getSelectedPricingModelId();
    const models = this.getVisibleFilteredModels();
    if (models.length === 0) return [this.theme.fg("accent", "Pricing model"), this.theme.fg("muted", "No models match the filter.")];
    return [this.theme.fg("accent", "Pricing model"), ...models.map(({ model, index }) => {
      const cursor = index === this.modelSelectionIndex ? "›" : " ";
      const marker = model.id === selectedId ? " (m)" : "";
      return `${cursor} ${model.label}${marker}`;
    })];
  }

  /**
   * Updates the model filter query from printable text and backspace input.
   *
   * @param data Raw keyboard input.
   * @returns True when filter input was handled.
   */
  private handleModelFilterInput(data: string): boolean {
    if (data === "\u007f" || matchesKey(data, Key.backspace)) {
      this.modelFilterQuery = this.modelFilterQuery.slice(0, -1);
      this.modelSelectionIndex = 0;
      this.refreshModelPanelLines();
      return true;
    }
    if (data.length !== 1 || data < " " || data === "\u007f") return false;
    this.modelFilterQuery = `${this.modelFilterQuery}${data}`;
    this.modelSelectionIndex = 0;
    this.refreshModelPanelLines();
    return true;
  }

  /**
   * Gets model rows visible in the capped selector viewport.
   *
   * @returns Visible model rows with filtered indexes.
   */
  private getVisibleFilteredModels(): Array<{ index: number; model: OpenRouterModelOption }> {
    const maxRows = 12;
    const models = this.getFilteredModels();
    const start = Math.max(0, Math.min(this.modelSelectionIndex - Math.floor(maxRows / 2), models.length - maxRows));
    return models.slice(start, start + maxRows).map((model, offset) => ({ index: start + offset, model }));
  }

  /**
   * Gets available pricing models matching the active filter.
   *
   * @returns Filtered model options.
   */
  private getFilteredModels(): OpenRouterModelOption[] {
    const query = this.modelFilterQuery.trim().toLowerCase();
    const models = this.getAvailableModels();
    if (!query) return models;
    return models.filter((model) => `${model.label} ${model.id}`.toLowerCase().includes(query));
  }

  /**
   * Gets available pricing model options from a combined report.
   *
   * @returns Available model options.
   */
  private getAvailableModels(): OpenRouterModelOption[] {
    return "availableModels" in this.report ? this.report.availableModels ?? [] : [];
  }

  /**
   * Gets the currently selected pricing model id.
   *
   * @returns Pricing model id.
   */
  private getSelectedPricingModelId(): string | undefined {
    return "pricingModelId" in this.report ? this.report.pricingModelId : undefined;
  }
}
