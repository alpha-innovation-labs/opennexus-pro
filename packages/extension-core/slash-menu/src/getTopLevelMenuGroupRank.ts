const TOP_LEVEL_GROUP_RANKS: Record<string, number> = {
	Resources: 0,
	"Custom Commands": 1,
	Chat: 2,
	Auth: 3,
	Configuration: 4,
	Workspace: 5,
	System: 6,
	Developer: 7,
	Extensions: 8,
	"Mini-Apps": 9,
};

/**
 * Returns the configured order rank for a top-level menu group.
 *
 * @param groupLabel Visible group label.
 * @returns Numeric sort rank.
 */
export function getTopLevelMenuGroupRank(
	groupLabel: string | undefined,
): number {
	return TOP_LEVEL_GROUP_RANKS[groupLabel ?? ""] ?? 99;
}
