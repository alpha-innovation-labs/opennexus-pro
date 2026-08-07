/**
 * Prints usage help for the provider CLI command.
 */
export function printProvidersHelp(): void {
  console.log(`Usage: nexus provider <subcommand> [options]

Subcommands:
  list                  List all known providers with configured status
  setup <provider> [port] [api_key]  Configure a provider (non-interactive)
  configure             Configure a provider interactively with filterable picker
  enable <provider>     Enable a provider
  disable <provider>    Disable a provider
  refresh [provider]    Probe and refresh models for all (or one) providers
  get <provider>        Show available models for a configured provider`);
}
