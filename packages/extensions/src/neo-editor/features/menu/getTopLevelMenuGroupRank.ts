const TOP_LEVEL_GROUP_RANKS: Record<string, number> = {
  Chat: 0,
  Auth: 1,
  Configuration: 2,
  Workspace: 3,
  System: 4,
  Developer: 5,
  Extensions: 6,
};

/**
 * Returns the configured order rank for a top-level menu group.
 *
 * @param groupLabel Visible group label.
 * @returns Numeric sort rank.
 */
export function getTopLevelMenuGroupRank(groupLabel: string | undefined): number {
  return TOP_LEVEL_GROUP_RANKS[groupLabel ?? ""] ?? 99;
}
