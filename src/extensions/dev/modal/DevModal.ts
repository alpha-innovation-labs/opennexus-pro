import { Key, matchesKey } from "@mariozechner/pi-tui";
import { SharedModal } from "../../shared/modal/index.js";
import { createDevModalFooter } from "./createDevModalFooter.js";
import { createDevModalHeader } from "./createDevModalHeader.js";
import { createDevModalPanes } from "./createDevModalPanes.js";
import { cycleDevModalIndex } from "./cycleDevModalIndex.js";
import type { DevModalTheme, DevModalVariation } from "./types.js";

export type DevModalOptions = {
  onClose: () => void;
  onRenderNeeded: () => void;
  theme: DevModalTheme;
  variations: DevModalVariation[];
};

/**
 * Interactive dev-only modal for testing shared modal layouts and tab navigation.
 */
export class DevModal extends SharedModal {
  private selectedIndex = 0;
  private readonly onRenderNeeded: () => void;
  private readonly variations: DevModalVariation[];

  /**
   * Creates a dev modal component.
   *
   * @param options Modal dependencies and data.
   */
  constructor(options: DevModalOptions) {
    const firstVariation = options.variations[0];
    super({
      footerLines: createDevModalFooter(options.theme),
      headerLines: createDevModalHeader(options.variations, 0, options.theme),
      maxWidthRatio: 0.7,
      minWidth: 50,
      onClose: options.onClose,
      panes: firstVariation ? createDevModalPanes(firstVariation, options.theme) : [],
      theme: options.theme,
    });
    this.onRenderNeeded = options.onRenderNeeded;
    this.variations = options.variations;
  }

  /**
   * Handles keyboard input for tab navigation and close.
   *
   * @param data Raw keyboard input.
   */
  override handleInput(data: string): void {
    if (matchesKey(data, Key.tab)) {
      this.selectVariation(1);
      return;
    }

    if (matchesKey(data, Key.shift("tab"))) {
      this.selectVariation(-1);
      return;
    }

    super.handleInput(data);
  }

  /**
   * Selects the next or previous modal variation.
   *
   * @param direction Navigation direction.
   */
  private selectVariation(direction: 1 | -1): void {
    this.selectedIndex = cycleDevModalIndex(this.selectedIndex, direction, this.variations.length);
    this.refreshSharedModalState();
    this.onRenderNeeded();
  }

  /**
   * Refreshes shared modal header and panes from the selected variation.
   */
  private refreshSharedModalState(): void {
    const selected = this.variations[this.selectedIndex];
    this.headerLines = createDevModalHeader(this.variations, this.selectedIndex, this.theme);
    this.panes = selected ? createDevModalPanes(selected, this.theme) : [];
  }
}
