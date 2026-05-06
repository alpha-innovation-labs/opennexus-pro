import type { WhichKeyGroup } from "./types.js";

/**
 * Splits which-key groups into balanced display columns.
 *
 * @param groups Groups to arrange.
 * @returns Left and right columns.
 */
export function arrangeWhichKeyGroups(groups: WhichKeyGroup[]): [WhichKeyGroup[], WhichKeyGroup[]] {
  const left: WhichKeyGroup[] = [];
  const right: WhichKeyGroup[] = [];
  let leftRows = 0;
  let rightRows = 0;
  for (const group of groups) {
    const rows = group.shortcuts.length + 3;
    if (leftRows <= rightRows) {
      left.push(group);
      leftRows += rows;
    } else {
      right.push(group);
      rightRows += rows;
    }
  }
  return [left, right];
}
