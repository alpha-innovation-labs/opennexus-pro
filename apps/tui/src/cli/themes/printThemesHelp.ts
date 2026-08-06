/**
 * Prints the themes subcommand help menu to stdout.
 */
export function printThemesHelp(): void {
  console.log(`Usage: nexus themes [subcommand]

List or set the active project theme.

Subcommands:
  list [theme-name]    List all available themes, optionally filter by name
  set <theme-name>     Set the active project theme

Examples:
  nexus themes list                List all available themes
  nexus themes list dark           Show info for the 'dark' theme
  nexus themes set dark            Set 'dark' as the active theme
  nexus themes                     Show this help menu`);
}
