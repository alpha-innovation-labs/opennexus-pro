import type { AiGateway } from "@nexus/extensions/ai-providers/AiGateway.js";
import { getGateways, readProviderConfig } from "@nexus/extensions/ai-providers/index.js";
import { getAllProviderIds } from "./getAllProviderIds.js";
import { parseProvidersCommand } from "./parseProvidersCommand.js";
import { handleListCommand } from "./handleListCommand.js";
import { handleSetupCommand } from "./handleSetupCommand.js";
import { handleConfigureCommand } from "./handleConfigureCommand.js";
import { handleEnableCommand } from "./handleEnableCommand.js";
import { handleDisableCommand } from "./handleDisableCommand.js";
import { handleRefreshCommand } from "./handleRefreshCommand.js";
import { handleGetCommand } from "./handleGetCommand.js";
import { printProvidersHelp } from "./printProvidersHelp.js";

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
  const gateways = getGateways(providerConfig);

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
