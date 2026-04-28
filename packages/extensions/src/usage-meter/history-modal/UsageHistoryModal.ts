import { Key, matchesKey } from "@mariozechner/pi-tui";
import { computeModalWidth, SharedModal } from "@nexus/tui-kit/modal/index.js";
import type { UsageHistoryRecord } from "../history/types.js";
import { createUsageHistoryFooter } from "./createUsageHistoryFooter.js";
import { createUsageHistoryHeader } from "./createUsageHistoryHeader.js";
import { createUsageHistoryLines } from "./createUsageHistoryLines.js";
import { createUsageHistoryModelOptions } from "./createUsageHistoryModelOptions.js";
import { createUsageHistoryWindowOptions } from "./createUsageHistoryWindowOptions.js";
import { cycleUsageHistoryModelIndex } from "./cycleUsageHistoryModelIndex.js";
import { filterUsageHistoryRecordsForModal } from "./filterUsageHistoryRecordsForModal.js";

/** Modal that renders historical usage graph series. */
export class UsageHistoryModal extends SharedModal {
  private selectedModelIndex = 0;
  private selectedWindowIndex = 0;
  private readonly onRenderNeeded: () => void;
  private readonly modelOptions: ReturnType<typeof createUsageHistoryModelOptions>;
  private readonly windowOptions = createUsageHistoryWindowOptions();

  /** Creates a usage history modal. */
  constructor(theme: ConstructorParameters<typeof SharedModal>[0]["theme"], private readonly records: UsageHistoryRecord[], onClose: () => void, onRenderNeeded: () => void) {
    const modelOptions = createUsageHistoryModelOptions(records);
    super({
      theme,
      minWidth: 72,
      maxWidthRatio: 0.85,
      headerLines: [createUsageHistoryHeader(theme, 0, 68)],
      panes: [{ id: "history", size: 1, lines: createUsageHistoryLines(filterUsageHistoryRecordsForModal(records, { model: modelOptions[0]!, window: "week" }), 68) }],
      footerLines: createUsageHistoryFooter(modelOptions, 0, theme),
      onClose,
    });
    this.onRenderNeeded = onRenderNeeded;
    this.modelOptions = modelOptions;
  }

  /** Handles model tab navigation and close shortcuts. */
  override handleInput(data: string): void {
    if (data === "1") return this.selectWindow(0);
    if (data === "2") return this.selectWindow(1);
    if (matchesKey(data, Key.tab)) return this.selectModel(1);
    if (matchesKey(data, Key.shift("tab"))) return this.selectModel(-1);
    super.handleInput(data);
  }

  /** Selects the next model/subscription filter tab. */
  private selectModel(direction: 1 | -1): void {
    this.selectedModelIndex = cycleUsageHistoryModelIndex(this.selectedModelIndex, direction, this.modelOptions.length);
    this.refreshSharedModalState(68);
    this.onRenderNeeded();
  }

  /** Selects one usage window filter. */
  private selectWindow(index: number): void {
    this.selectedWindowIndex = Math.max(0, Math.min(this.windowOptions.length - 1, index));
    this.refreshSharedModalState(68);
    this.onRenderNeeded();
  }

  /** Renders after refreshing width-aware header and charts. */
  override render(width: number): string[] {
    const modalWidth = computeModalWidth(width, 72, 0.85);
    this.refreshSharedModalState(Math.max(1, modalWidth - 2));
    return super.render(width);
  }

  /** Refreshes modal panes and footer from selected filters. */
  private refreshSharedModalState(contentWidth: number): void {
    const model = this.modelOptions[this.selectedModelIndex] ?? this.modelOptions[0]!;
    const window = this.windowOptions[this.selectedWindowIndex] ?? "week";
    const records = filterUsageHistoryRecordsForModal(this.records, { model, window });
    this.headerLines = [createUsageHistoryHeader(this.theme, this.selectedWindowIndex, contentWidth)];
    this.panes = [{ id: "history", size: 1, lines: createUsageHistoryLines(records, Math.max(1, contentWidth - 4)) }];
    this.footerLines = createUsageHistoryFooter(this.modelOptions, this.selectedModelIndex, this.theme);
  }
}
