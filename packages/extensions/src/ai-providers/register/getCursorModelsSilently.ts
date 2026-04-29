import { getCursorModels, type CursorModel } from "pi-cursor-provider/proxy.js";
import { withSilencedCursorModelDiscoveryWarnings } from "./withSilencedCursorModelDiscoveryWarnings.js";

/**
 * Discovers Cursor models without surfacing expected empty-result startup warnings.
 *
 * @param accessToken Cursor OAuth access token.
 * @returns Cursor models discovered from the live endpoint.
 */
export function getCursorModelsSilently(accessToken: string): Promise<CursorModel[]> {
	return withSilencedCursorModelDiscoveryWarnings(() => getCursorModels(accessToken));
}
