import type { MarkdownPreviewStyleToken } from "./types.js";

type HeadingAnsiColors = {
  background: string;
  foreground: string;
};

const headingColors: Record<string, HeadingAnsiColors> = {
  "heading.h1.background": { background: "80;40;80", foreground: "255;180;255" },
  "heading.h2.background": { background: "40;60;80", foreground: "130;180;255" },
  "heading.h3.background": { background: "40;80;60", foreground: "130;255;180" },
  "heading.h4.background": { background: "80;60;40", foreground: "255;200;130" },
  "heading.h5.background": { background: "60;60;60", foreground: "200;200;200" },
  "heading.h6.background": { background: "50;50;50", foreground: "170;170;170" },
};

/** Applies Ratkit heading foreground/background ANSI colors for H1-H6 bars. */
export function styleMarkdownHeadingBackground(token: MarkdownPreviewStyleToken, value: string): string {
  const colors = headingColors[token];
  if (colors === undefined) return value;
  return `\x1b[48;2;${colors.background}m\x1b[38;2;${colors.foreground}m${value}\x1b[0m`;
}
