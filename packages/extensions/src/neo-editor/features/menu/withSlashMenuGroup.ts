/**
 * Attaches Nexus slash-menu grouping metadata to a Pi command definition.
 *
 * @param definition Pi command definition.
 * @param menuGroup Nexus slash-menu group label.
 * @returns Command definition with runtime menu-group metadata.
 */
export function withSlashMenuGroup<T extends object>(definition: T, menuGroup: string): T {
  return Object.assign(definition, { menuGroup });
}
