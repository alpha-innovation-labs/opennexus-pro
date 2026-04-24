import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { getUsageTextForModel } from "./model/getUsageTextForModel.js";
import { renderUsageTextForModel } from "./model/renderUsageTextForModel.js";
import { registerSlashUsageExtension } from "./registerSlashUsageExtension.js";
import { refreshUsageForContext } from "./runtime/refreshUsageForContext.js";
import { subscribeUsageSnapshots } from "./store/subscribeUsageSnapshots.js";

export { getUsageTextForModel, refreshUsageForContext, renderUsageTextForModel, subscribeUsageSnapshots };

/**
 * Registers slash-usage.
 *
 * @param pi Pi extension API.
 */
export default function index(pi: ExtensionAPI): void {
	registerSlashUsageExtension(pi);
}
