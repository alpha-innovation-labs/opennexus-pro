import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { loadVendorExtension } from "./loadVendorExtension.js";

/**
 * Registers the Nexus-native ask-user-question extension backed by vendored @juicesharp/rpiv-ask-user-question.
 *
 * @param pi Pi extension API.
 */
export async function registerVendorRpivAskUserQuestionExtension(pi: ExtensionAPI): Promise<void> {
  await loadVendorExtension(import("../vendor/rpiv-ask-user-question/index.js"), pi);
}
