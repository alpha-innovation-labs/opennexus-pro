import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerCompactToolLinesExtension from "./compact-tool-lines/registerCompactToolLinesExtension";
import registerSkillInvocationStyleExtension from "./skill-invocation/registerSkillInvocationStyleExtension";
import registerAssistantThinkingStyleExtension from "./thinking/registerAssistantThinkingStyleExtension";
import registerToolCallsExtension from "./toolcalls/registerToolCallsExtension";
import registerUserMessageInputStyleExtension from "./user-message/registerUserMessageInputStyleExtension";
export { activityInvalidators } from "./activity/state";
export { invalidateActivityKeys } from "./invalidateActivityKeys";
export { setToolGroupCollapseEnabled, toggleToolGroupCollapse, isToolGroupCollapseEnabled } from "./collapse/state";
export { createTronToolWrappingExtensionApi } from "./compact-tool-lines/createTronToolWrappingExtensionApi";
export type { BuiltInTools } from "./compact-tool-lines/types";
export { renderTranscriptLines } from "./transcript/renderTranscriptLines";
export type { TranscriptEntry } from "./transcript/types";
export { colorToolCallIcon } from "./colors/colorToolCallIcon";
export { colorSecondaryText } from "./colors/colorSecondaryText";

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
