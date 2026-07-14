import type { Component } from "@earendil-works/pi-tui";

/**
 * Test component that renders a fixed set of lines.
 */
export class LinesComponent implements Component {
  constructor(private readonly getLines: (width: number) => string[]) {}

  render(width: number): string[] {
    return this.getLines(width);
  }

  invalidate(): void {}
}
