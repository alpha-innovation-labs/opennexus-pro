import { TUI, isFocusable, type Component } from "@earendil-works/pi-tui";
import { VirtualTerminal } from "../terminal/VirtualTerminal.js";
import { trimTrailingEmptyLines } from "../viewport/trimTrailingEmptyLines.js";

/**
 * Renders a component inside the virtual terminal and returns the viewport.
 *
 * @param createComponent Factory that receives the test TUI.
 * @param columns Terminal width.
 * @param rows Terminal height.
 * @returns Rendered viewport lines.
 */
export async function renderComponentInVirtualTerminal(
  createComponent: (tui: TUI) => Component,
  columns = 100,
  rows = 30,
): Promise<string[]> {
  const terminal = new VirtualTerminal(columns, rows);
  const tui = new TUI(terminal, false);
  const component = createComponent(tui);
  tui.addChild(component);
  if (isFocusable(component)) {
    tui.setFocus(component);
  }
  tui.start();
  tui.requestRender(true);
  await terminal.waitForRender();
  const viewport = trimTrailingEmptyLines(terminal.getViewport());
  tui.stop();
  return viewport;
}
