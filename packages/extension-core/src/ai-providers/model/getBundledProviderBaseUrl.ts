import { getBuiltinModels } from "@earendil-works/pi-ai/providers/all";

/**
 * Reads the base URL from the first model of a bundled Pi provider.
 *
 * @param providerId Bundled Pi provider id.
 * @returns Provider base URL, when bundled models exist.
 */
export function getBundledProviderBaseUrl(providerId: string): string | undefined {
  return getBuiltinModels(providerId as never)[0]?.baseUrl;
}
