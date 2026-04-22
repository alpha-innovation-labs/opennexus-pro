import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { getUsageTextForModel } from "./model/getUsageTextForModel.js";
import { renderUsageTextForModel } from "./model/renderUsageTextForModel.js";
import { registerPiSlashUsageExtension } from "./registerPiSlashUsageExtension.js";
import { refreshUsageForContext } from "./runtime/refreshUsageForContext.js";
import { subscribeUsageSnapshots } from "./store/subscribeUsageSnapshots.js";

export { getUsageTextForModel, refreshUsageForContext, renderUsageTextForModel, subscribeUsageSnapshots };

/**
 * Registers pi-slash-usage.
 *
 * @param pi Pi extension API.
 */
export default function index(pi: ExtensionAPI): void {
	registerPiSlashUsageExtension(pi);
}
