import type { Terminal } from "@earendil-works/pi-tui";
import type { Terminal as XtermTerminalType } from "@xterm/headless";
import xterm from "@xterm/headless";

const XtermTerminal = xterm.Terminal;

/**
 * Virtual terminal for deterministic TUI testing.
 */
export class VirtualTerminal implements Terminal {
  private xterm: XtermTerminalType;
  private inputHandler?: (data: string) => void;
  private resizeHandler?: () => void;
  private _columns: number;
  private _rows: number;

  constructor(columns = 80, rows = 24) {
    this._columns = columns;
    this._rows = rows;
    this.xterm = new XtermTerminal({
      cols: columns,
      rows,
      disableStdin: true,
      allowProposedApi: true,
    });
  }

  start(onInput: (data: string) => void, onResize: () => void): void {
    this.inputHandler = onInput;
    this.resizeHandler = onResize;
    this.xterm.write("\x1b[?2004h");
  }

  async drainInput(): Promise<void> {}

  stop(): void {
    this.xterm.write("\x1b[?2004l");
    this.inputHandler = undefined;
    this.resizeHandler = undefined;
  }

  write(data: string): void {
    this.xterm.write(data);
  }

  get columns(): number {
    return this._columns;
  }

  get rows(): number {
    return this._rows;
  }

  get kittyProtocolActive(): boolean {
    return true;
  }

  moveBy(lines: number): void {
    if (lines > 0) this.xterm.write(`\x1b[${lines}B`);
    if (lines < 0) this.xterm.write(`\x1b[${-lines}A`);
  }

  hideCursor(): void {
    this.xterm.write("\x1b[?25l");
  }

  showCursor(): void {
    this.xterm.write("\x1b[?25h");
  }

  clearLine(): void {
    this.xterm.write("\x1b[K");
  }

  clearFromCursor(): void {
    this.xterm.write("\x1b[J");
  }

  clearScreen(): void {
    this.xterm.write("\x1b[2J\x1b[H");
  }

  setProgress(_active: boolean): void {}

  setTitle(title: string): void {
    this.xterm.write(`\x1b]0;${title}\x07`);
  }

  /**
   * Waits until buffered terminal writes have flushed.
   */
  async flush(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.xterm.write("", () => resolve());
    });
  }

  /**
   * Returns the visible viewport lines.
   */
  getViewport(): string[] {
    const lines: string[] = [];
    const buffer = this.xterm.buffer.active;
    for (let index = 0; index < this.xterm.rows; index += 1) {
      const line = buffer.getLine(buffer.viewportY + index);
      lines.push(line ? line.translateToString(true) : "");
    }
    return lines;
  }

  /**
   * Waits for the TUI render loop to settle.
   */
  async waitForRender(): Promise<void> {
    await new Promise<void>((resolve) => process.nextTick(resolve));
    await new Promise<void>((resolve) => setTimeout(resolve, 20));
    await this.flush();
  }
}
