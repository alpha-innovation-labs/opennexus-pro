import { autocomplete, text, isCancel } from "@clack/prompts";
import { DEFAULT_PORTS } from "@extensions/ai-providers/constants/default-ports";
import { createGateway } from "@extensions/ai-providers/gateway/createGateway";
import { readProviderConfig } from "@extensions/ai-providers/config/readProviderConfig";
import { getAllProviderIds } from "./getAllProviderIds";
import { writeProviderConfig } from "@extensions/ai-providers/config/writeProviderConfig";
import { BOLD, GREEN, RESET } from "../shared/ansiColors";

/**
 * Handles the "configure" subcommand: launches an interactive, fuzzy-filtered
 * provider picker via @clack/prompts autocomplete, then prompts for host,
 * port, and optional API key.
 *
 * When `providerId` is provided (e.g. `nexus provider configure litellm`),
 * skips the picker and goes straight to the field prompts.
 *
 * Prefills host, port, and api_key from any existing configuration so the
 * user can review and edit without re-typing everything.  The API key field
 * uses masked input and accepts an empty string to **clear** a stored key.
 *
 * After writing the config, probes the gateway (exists + fetchModels),
 * reports the discovered models, and allows the user to re-edit the
 * connection if the probe fails — looping until success or cancellation.
 *
 * @param providerId Optional provider ID to skip the picker.
 * @param cliHost Optional --host value from CLI.
 * @param cliPort Optional --port value from CLI.
 * @param cliApiKey Optional --api-key value from CLI.
 * @returns Exit code (0 = success, 1 = cancelled / error).
 */
export async function handleConfigureCommand(
  providerId?: string,
  cliHost?: string,
  cliPort?: number,
  cliApiKey?: string,
): Promise<number> {
  const knownIds = getAllProviderIds();
  const existingConfig = readProviderConfig();

  let selectedProviderId: string;

  // Step 1 — provider picker (skip if providerId already provided)
  if (providerId) {
    if (!knownIds.includes(providerId)) {
      console.error(`Unknown provider: '${providerId}'.`);
      return 1;
    }
    selectedProviderId = providerId;
  } else {
    // Fuzzy-filtered provider picker using @clack/prompts autocomplete
    const selected = await autocomplete({
      message: "Select a provider:",
      options: knownIds.map((id) => ({
        value: id,
        label: id,
        hint: `default port: ${DEFAULT_PORTS[id] ?? "—"}`,
      })),
      placeholder: "Type to filter...",
    });

    if (isCancel(selected)) {
      return 0;
    }

    selectedProviderId = selected;
  }

  const providerIdResolved = selectedProviderId;
  const existing = existingConfig[providerIdResolved];
  const defaultPort = DEFAULT_PORTS[providerIdResolved] ?? 0;

  // Resolve CLI-provided values vs interactive prompts.
  // When CLI args are supplied, skip interactive prompts for those fields
  // and validate them directly.  Missing CLI values fall back to interactive.
  let cliHostValue: string | undefined = cliHost;
  let cliPortValue: number | undefined = cliPort;
  let cliApiKeyVal: string | undefined = cliApiKey;

  // Step 2 — collect connection details (with retry loop)
  let success = false;

  while (!success) {
    let host: string;
    let port: number;
    let apiKey: string;

    // --- host ---
    if (cliHostValue !== undefined) {
      host = cliHostValue;
      if (!host.trim()) {
        console.error("Host is required.");
        return 1;
      }
    } else {
      const promptResult = await text({
        message: `Enter host for ${providerIdResolved}:`,
        initialValue: existing?.host ?? "localhost",
        validate: (value) => (value.trim() ? undefined : "Host is required."),
      });
      if (isCancel(promptResult)) {
        return 0;
      }
      host = promptResult;
    }

    // --- port ---
    if (cliPortValue !== undefined) {
      if (!Number.isInteger(cliPortValue) || cliPortValue <= 0) {
        console.error("Port must be a positive integer.");
        return 1;
      }
      port = cliPortValue;
    } else {
      const promptResult = await text({
        message: `Enter port for ${providerIdResolved}:`,
        initialValue: existing?.port ? String(existing.port) : String(defaultPort),
        validate: (value) => {
          if (!value) return "Port is required.";
          const n = Number(value);
          return Number.isInteger(n) && n > 0 ? undefined : "Port must be a positive integer.";
        },
      });
      if (isCancel(promptResult)) {
        return 0;
      }
      port = Number(promptResult);
    }

    // --- api key ---
    const existingKey = (existing as { api_key?: string })?.api_key ?? "";
    if (cliApiKeyVal !== undefined) {
      apiKey = cliApiKeyVal;
    } else {
      const promptResult = await text({
        message: existingKey
          ? `Enter API key for ${providerIdResolved} (optional, leave blank to clear; key already stored):`
          : `Enter API key for ${providerIdResolved} (optional, leave blank to clear):`,
        initialValue: existingKey,
        mask: "•",
      });
      if (isCancel(promptResult)) {
        return 0;
      }
      apiKey = promptResult;
    }

    // Build config — omit api_key if the user cleared it or left it blank
    const config: { host: string; port: number; api_key?: string } = {
      host,
      port,
    };

    if (apiKey && apiKey.trim() !== "") {
      config.api_key = apiKey;
    }

    writeProviderConfig(providerIdResolved, config);

    // Build a temporary gateway to probe
    const baseUrl = `http://${host}:${port}`;
    const gateway = createGateway(providerIdResolved, {
      baseUrl,
      apiKey: config.api_key,
    });

    console.log(`\nProbing ${providerIdResolved} at ${baseUrl}…`);

    const probe = await gateway.exists();
    const models = await gateway.getModels();

    if (probe.status === "unreachable") {
      console.error(`\n✗ Provider is unreachable at ${baseUrl} (${probe.reason}).`);
    } else if (probe.status === "error") {
      console.error(`\n✗ Provider responded with ${probe.statusCode} ${probe.statusText} at ${baseUrl} (check your API key).`);
    } else {
      // ok — server is reachable
    }

    if (probe.status === "unreachable" || (probe.status === "error" && models.length === 0)) {
      const retry = await text({
        message: "Press Enter to re-edit, or type 'cancel' to abort:",
        initialValue: "",
      });

      if (isCancel(retry) || (retry && retry.trim().toLowerCase() === "cancel")) {
        return 0;
      }
      const refreshed = readProviderConfig();
      Object.assign(existing, refreshed[providerIdResolved]);
      continue;
    }

    // Success — display models
    if (models.length > 0) {
      console.log(`\n✓ ${providerIdResolved} is reachable (${models.length} models found):\n`);
      for (const model of models) {
        console.log(`  ${BOLD}${model.id}${RESET}`);
      }
    } else {
      console.log(`\n✓ ${providerIdResolved} is reachable but no models exposed.`);
    }

    success = true;
  }

  return 0;
}
