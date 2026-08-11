import { getGateways, readProviderConfig } from "@extensions/ai-providers/index";
import { parseProvidersCommand } from "./parseProvidersCommand";
import { handleListCommand } from "./handleListCommand";
import { handleSetupCommand } from "./handleSetupCommand";
import { handleConfigureCommand } from "./handleConfigureCommand";
import { handleEnableCommand } from "./handleEnableCommand";
import { handleDisableCommand } from "./handleDisableCommand";
import { handleRefreshCommand } from "./handleRefreshCommand";
import { handleGetCommand } from "./handleGetCommand";
import { printProvidersHelp } from "./printProvidersHelp";

/**
 * Dispatches the provider CLI command to the appropriate subcommand handler.
 *
 * @param argv Raw CLI arguments starting with "provider".
 * @returns Process exit code.
 */
export async function runProvidersCommand(argv: readonly string[]): Promise<number> {
  const parsed = parseProvidersCommand(argv);
  if ("error" in parsed) {
    console.error(`${parsed.error}\n`);
    printProvidersHelp();
    return 1;
  }

  const { request } = parsed;
  const providerConfig = readProviderConfig();
  const gateways = await getGateways(providerConfig);

  switch (request.action) {
    case "list":
      return handleListCommand(request.json, gateways);
    case "setup":
      return handleSetupCommand(request.providerId, request.port, request.apiKey);
    case "configure":
      return await handleConfigureCommand(
        request.providerId,
        request.host,
        request.port,
        request.apiKey,
      );
    case "enable":
      return handleEnableCommand(request.providerId);
    case "disable":
      return handleDisableCommand(request.providerId);
    case "refresh":
      return handleRefreshCommand(request.providerId, gateways);
    case "get":
      return handleGetCommand(request.providerId, gateways);
  }
}
