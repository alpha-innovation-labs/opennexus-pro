/**
 * Parsed options for the provider subcommand dispatcher.
 */
export type ProviderSubcommand =
  | { action: "list"; json: boolean }
  | { action: "setup"; providerId: string; port?: number; apiKey?: string }
  | { action: "configure"; providerId?: string; host?: string; port?: number; apiKey?: string }
  | { action: "enable"; providerId: string }
  | { action: "disable"; providerId: string }
  | { action: "refresh"; providerId?: string }
  | { action: "get"; providerId: string };

/**
 * Parses the provider subcommand from argv.
 *
 * @param argv Raw CLI arguments starting with "provider".
 * @returns Parsed subcommand, or an error message.
 */
export function parseProvidersCommand(
  argv: readonly string[],
): { request: ProviderSubcommand } | { error: string } {
  const subcommand = argv[1];
  const json = argv.includes("--json");

  switch (subcommand) {
    case "list":
      return { request: { action: "list", json } };

    case "setup": {
      const providerId = argv[2];
      if (!providerId) {
        return { error: "Missing provider ID for setup." };
      }
      const portArg = argv[3];
      const port = portArg ? parseInt(portArg, 10) : undefined;
      const apiKey = argv[4];
      return { request: { action: "setup", providerId, port, apiKey } };
    }

    case "enable": {
      const providerId = argv[2];
      if (!providerId) {
        return { error: "Missing provider ID for enable." };
      }
      return { request: { action: "enable", providerId } };
    }

    case "disable": {
      const providerId = argv[2];
      if (!providerId) {
        return { error: "Missing provider ID for disable." };
      }
      return { request: { action: "disable", providerId } };
    }

    case "refresh": {
      const providerId = argv[2];
      return { request: { action: "refresh", providerId } };
    }

    case "get": {
      const providerId = argv[2];
      if (!providerId) {
        return { error: "Missing provider ID for get." };
      }
      return { request: { action: "get", providerId } };
    }

    case "configure": {
      const providerId = argv[2];
      // Parse --host, --port, and --api-key flags
      const hostIdx = argv.indexOf("--host");
      const portIdx = argv.indexOf("--port");
      const apiKeyIdx = argv.indexOf("--api-key");
      const host = hostIdx !== -1 && hostIdx + 1 < argv.length ? argv[hostIdx + 1] : undefined;
      const port =
        portIdx !== -1 && portIdx + 1 < argv.length
          ? parseInt(argv[portIdx + 1], 10)
          : undefined;
      const apiKey = apiKeyIdx !== -1 && apiKeyIdx + 1 < argv.length
        ? argv[apiKeyIdx + 1]
        : undefined;
      return { request: { action: "configure", providerId, host, port, apiKey } };
    }

    default:
      return { error: `Unknown provider subcommand: ${subcommand}.` };
  }
}
