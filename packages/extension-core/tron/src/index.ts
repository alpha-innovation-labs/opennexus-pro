import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { applyAssistantFooterSpacingPatch } from "@nexus/pi-platform/applyAssistantFooterSpacingPatch";
import { applyMarkdownHeadingLevelPatch } from "@nexus/pi-platform/applyMarkdownHeadingLevelPatch";
import registerCompactToolLinesExtension from "./compact-tool-lines/registerCompactToolLinesExtension";
import registerSkillInvocationStyleExtension from "./skill-invocation/registerSkillInvocationStyleExtension";
import registerAssistantThinkingStyleExtension from "./thinking/registerAssistantThinkingStyleExtension";
import registerToolCallsExtension from "./toolcalls/registerToolCallsExtension";
import registerUserMessageInputStyleExtension from "./user-message/registerUserMessageInputStyleExtension";

/**
 * Registers the tron message-area extension surfaces.
 *
 * @param pi Pi extension API.
 */
export default function index(pi: ExtensionAPI): void {
	applyAssistantFooterSpacingPatch();
	applyMarkdownHeadingLevelPatch();
	registerUserMessageInputStyleExtension(pi);
	registerSkillInvocationStyleExtension(pi);
	registerAssistantThinkingStyleExtension(pi);
	registerCompactToolLinesExtension(pi);
	registerToolCallsExtension(pi);
}
