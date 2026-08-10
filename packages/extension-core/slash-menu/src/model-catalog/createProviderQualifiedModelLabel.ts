import type { Api, Model } from "@earendil-works/pi-ai";

/**
 * Builds the provider-qualified label used by model catalog rows.
 *
 * @param model Model metadata from Pi's generated registry.
 * @returns Provider/model label.
 */
export function createProviderQualifiedModelLabel(model: Model<Api>): string {
  return `${model.provider}/${model.id}`;
}
