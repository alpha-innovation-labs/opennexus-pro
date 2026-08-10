import type { HotkeysGroup } from "./types";

/**
 * Splits hotkeys groups into balanced display columns.
 *
 * @param groups Groups to arrange.
 * @returns Left and right columns.
 */
export function arrangeHotkeysGroups(groups: HotkeysGroup[]): [HotkeysGroup[], HotkeysGroup[]] {
  const left: HotkeysGroup[] = [];
  const right: HotkeysGroup[] = [];
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
