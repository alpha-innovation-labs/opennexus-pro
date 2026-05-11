import { createAgentSession, DefaultResourceLoader, getAgentDir, SessionManager, type ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { applyAutomationAgentUpdate } from "./applyAutomationAgentUpdate.js";
import { createAutomationChatSessionPath } from "./createAutomationChatSessionPath.js";
import { createAutomationChatSystemPrompt } from "./createAutomationChatSystemPrompt.js";
import { extractAutomationAgentUpdate } from "./extractAutomationAgentUpdate.js";
import { prepareAutomationChatSessionFile } from "./prepareAutomationChatSessionFile.js";
import { toAutomationChatMessages } from "./toAutomationChatMessages.js";
import type { AutomationRecord } from "../core/storage/types.js";
import type { AutomationChatMessage } from "../modal/types.js";

/**
 * Sends one automation edit request to a hidden agent and applies its update.
 */
export async function sendAutomationChatMessage(ctx: ExtensionCommandContext, automation: AutomationRecord, messages: AutomationChatMessage[], input: string, onUpdate: (messages: AutomationChatMessage[]) => void): Promise<{ automation: AutomationRecord; messages: AutomationChatMessage[] }> {
	const sessionPath = createAutomationChatSessionPath(ctx.sessionManager.getSessionDir(), automation.id);
	await prepareAutomationChatSessionFile(sessionPath);
	const hiddenSessionManager = SessionManager.open(sessionPath, ctx.sessionManager.getSessionDir(), ctx.cwd);
	const resourceLoader = new DefaultResourceLoader({ cwd: ctx.cwd, agentDir: getAgentDir(), systemPromptOverride: (base) => `${base}\n\n${createAutomationChatSystemPrompt(automation)}` });
	await resourceLoader.reload();
	const { session } = await createAgentSession({ cwd: ctx.cwd, model: ctx.model, modelRegistry: ctx.modelRegistry, resourceLoader, sessionManager: hiddenSessionManager });
	const unsubscribe = session.subscribe(() => onUpdate(toAutomationChatMessages(session.messages as never)));
	await session.prompt(input);
	unsubscribe();
	session.dispose();
	const agentMessages = toAutomationChatMessages(hiddenSessionManager.buildSessionContext().messages as never);
	const lastAssistant = [...agentMessages].reverse().find((message) => message.role === "assistant");
	const update = lastAssistant ? extractAutomationAgentUpdate(lastAssistant.content) : null;
	return { automation: update ? applyAutomationAgentUpdate(automation, update) : automation, messages: agentMessages.length > 0 ? agentMessages : messages };
}
