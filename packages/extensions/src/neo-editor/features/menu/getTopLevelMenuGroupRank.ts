const TOP_LEVEL_GROUP_RANKS: Record<string, number> = {
  Resources: 0,
  Chat: 1,
  Auth: 2,
  Configuration: 3,
  Workspace: 4,
  System: 5,
  Developer: 6,
  Extensions: 7,
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
