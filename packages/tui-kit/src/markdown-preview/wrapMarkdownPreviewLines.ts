import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

/** Wraps rendered markdown preview rows to a visible width. */
export function wrapMarkdownPreviewLines(line: string, width: number): string[] {
  const targetWidth = Math.max(1, Math.floor(width));
  if (visibleWidth(line) <= targetWidth) return [line];
  const words = line.split(/(\s+)/u).filter((part) => part.length > 0);
  const rows: string[] = [];
  let current = "";

  for (const word of words) {
    if (current.length === 0 && visibleWidth(word) > targetWidth) {
      rows.push(...hardWrapMarkdownPreviewWord(word, targetWidth));
      continue;
    }
    if (visibleWidth(`${current}${word}`) <= targetWidth) {
      current = `${current}${word}`;
      continue;
    }
    if (current.trim().length > 0) rows.push(current.trimEnd());
    current = word.trimStart();
  }

  if (current.trim().length > 0) rows.push(current.trimEnd());
  return rows.length > 0 ? rows : [""];
}

/** Hard-wraps a single overlong word to a visible width. */
function hardWrapMarkdownPreviewWord(word: string, width: number): string[] {
  const rows: string[] = [];
  let remaining = word;
  while (visibleWidth(remaining) > width) {
    const chunk = truncateToWidth(remaining, width, "");
    rows.push(chunk);
    remaining = remaining.slice(chunk.length);
  }
  if (remaining.length > 0) rows.push(remaining);
  return rows;
}
