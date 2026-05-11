import { Key, matchesKey, type AutocompleteItem } from "@earendil-works/pi-tui";
import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { computeTwoPaneWidths, SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";
import { renderSubagentTranscriptLines } from "./renderSubagentTranscriptLines.js";
import type { SubagentRun } from "../types.js";

/**
 * Builds one selectable item for a tracked subagent run.
 *
 * @param run Target run.
 * @returns Modal item.
 */
function createRunItem(run: SubagentRun): AutocompleteItem {
  return {
    value: run.id,
    label: run.title,
    description: [run.status, run.subagentType, run.cwd || "(unknown cwd)"].join(" · "),
  };
}

/**
 * Two-pane modal for browsing subagent runs and transcripts.
 */
export class SubagentHistoryModal extends SelectPreviewModal {
  private readonly runsById: Map<string, SubagentRun>;
  private readonly transcriptTheme: ExtensionCommandContext["ui"]["theme"];
  private selectedValue?: string;
  private renderedTranscriptValue?: string;
  private renderedTranscriptWidth?: number;

  constructor(
    theme: ExtensionCommandContext["ui"]["theme"],
    runs: SubagentRun[],
    done: () => void,
  ) {
    super(theme, () => {}, () => done(), undefined, {
      leftTitle: "Agents",
      rightTitle: "Transcript",
      leftPaneRatio: 0.38,
    });
    this.transcriptTheme = theme;
    this.runsById = new Map(runs.map((run) => [run.id, run]));
    this.setOnPick(() => {
      this.focusRightPane();
    });
    this.setOnSelectionChange((item) => {
      this.selectedValue = item?.value;
      this.renderedTranscriptValue = undefined;
      this.renderedTranscriptWidth = undefined;
      this.setRightLines([]);
    });
    const items = runs.map(createRunItem);
    this.setItems(items);
    this.selectedValue = items[0]?.value;
    this.setRightLines(runs[0] ? [] : ["No subagent runs yet"]);
  }

  /**
   * Handles Vim-like transcript navigation for the right pane.
   *
   * @param data Raw terminal input.
   */
  override handleInput(data: string): void {
    if (!this.isRightPaneFocused() && matchesKey(data, Key.enter)) {
      this.focusRightPane();
      return;
    }
    super.handleInput(data);
  }

  /**
   * Renders the current modal with Tron-styled transcript content.
   *
   * @param width Available width.
   * @returns Rendered modal lines.
   */
  override render(width: number): string[] {
    const run = this.selectedValue ? this.runsById.get(this.selectedValue) : undefined;
    if (run) {
      const dialogWidth = Math.max(80, Math.min(width, Math.floor(width * 0.9)));
      const innerWidth = Math.max(78, dialogWidth - 2);
      const { rightWidth } = computeTwoPaneWidths(innerWidth, true, 0.38);
      const transcriptWidth = Math.max(24, rightWidth);
      if (this.renderedTranscriptValue !== run.id || this.renderedTranscriptWidth !== transcriptWidth) {
        this.setRightLines(renderSubagentTranscriptLines(this.transcriptTheme, transcriptWidth, run));
        this.scrollRightToEnd();
        this.renderedTranscriptValue = run.id;
        this.renderedTranscriptWidth = transcriptWidth;
      }
    }
    return super.render(width);
  }
}
