import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerAskUserQuestionExtension from "./index.js";

export { registerAskUserQuestionExtension };
export default registerAskUserQuestionExtension;

/**
 * Registers the Nexus ask_user_question tool.
 *
 * @param pi Pi extension API.
 */
export function registerNexusAskUserQuestionExtension(pi: ExtensionAPI): void {
	registerAskUserQuestionExtension(pi);
}
