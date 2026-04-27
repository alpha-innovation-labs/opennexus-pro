import type { AutocompleteItem } from "@mariozechner/pi-tui";
import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TwoPaneSelectModal, sanitizePlainText } from "../../../shared/two-pane-select-modal/index.js";

/**
 * Two-pane picker used for `@` file and folder autocomplete.
 */
export class AtModal extends TwoPaneSelectModal {
  constructor(
    private readonly cwd: string,
    private readonly previewTheme: ExtensionContext["ui"]["theme"],
    onPick: (item: AutocompleteItem) => void,
    onClose: () => void,
    requestRender: () => void,
  ) {
    super(previewTheme, onPick, onClose, undefined, {
      leftTitle: "Results",
      rightTitle: "Preview",
      bottomTitle: "Find Files",
      bottomPrefix: "> @",
    });

    this.setOnSelectionChange((item) => {
      void this.updatePreview(item, requestRender);
    });
  }

  /**
   * Updates the query line shown in the bottom section.
   *
   * @param query Active autocomplete query.
   */
  setQuery(query: string): void {
    this.setBottom("Find Files", query, "> @");
  }

  /**
   * Keeps compatibility with the prior editor API.
   *
   * @param _mode Autocomplete mode.
   */
  setMode(_mode: "file"): void {}

  /**
   * Refreshes the right-pane preview for the selected item.
   *
   * @param item Selected autocomplete item.
   * @param requestRender Render callback.
   */
  private async updatePreview(item: AutocompleteItem | null, requestRender: () => void): Promise<void> {
    if (!item?.value) {
      this.setRightLines([this.previewTheme.fg("dim", "No preview")]);
      requestRender();
      return;
    }

    const path = resolve(this.cwd, item.value.replace(/^@/, ""));
    try {
      const content = readFileSync(path, "utf8");
      const rawLines = content.split("\n").slice(0, 16);
      const previewLines = rawLines.map((line) => this.previewTheme.fg("muted", sanitizePlainText(line)));
      if (content.split("\n").length > 16) previewLines.push(this.previewTheme.fg("dim", "…"));
      this.setRightLines(previewLines);
    } catch {
      this.setRightLines([this.previewTheme.fg("dim", item.value), this.previewTheme.fg("warning", "Preview unavailable")]);
    }
    requestRender();
  }
}
