import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerCompactToolLinesExtension from "./compact-tool-lines/registerCompactToolLinesExtension.js";
import registerSkillInvocationStyleExtension from "./skill-invocation/registerSkillInvocationStyleExtension.js";
import registerAssistantThinkingStyleExtension from "./thinking/registerAssistantThinkingStyleExtension.js";
import registerToolCallsExtension from "./toolcalls/registerToolCallsExtension.js";
import registerUserMessageInputStyleExtension from "./user-message/registerUserMessageInputStyleExtension.js";

/**
 * Registers the tron message-area extension surfaces.
 *
 * @param pi Pi extension API.
 */
export default function index(pi: ExtensionAPI): void {
  registerUserMessageInputStyleExtension(pi);
  registerSkillInvocationStyleExtension(pi);
  registerAssistantThinkingStyleExtension(pi);
  registerCompactToolLinesExtension(pi);
  registerToolCallsExtension(pi);
}
