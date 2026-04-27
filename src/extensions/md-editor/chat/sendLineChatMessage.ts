import { createAgentSession, DefaultResourceLoader, getAgentDir, SessionManager, type ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { readFile } from "node:fs/promises";
import { computeMarkdownFileSnapshot, type MarkdownFileSnapshot } from "../file/computeMarkdownFileSnapshot.js";
import { createLineFingerprint } from "../line-chat/createLineChatKey.js";
import { getLineChatSessionPath } from "../line-chat/getLineChatSessionPath.js";
import { persistLineChatSession } from "../line-chat/persistLineChatSession.js";
import { prepareLineChatSessionFile } from "../line-chat/prepareLineChatSessionFile.js";
import type { LineChatSession } from "../line-chat/types.js";
import { createLineChatSystemPrompt } from "./createLineChatSystemPrompt.js";
import { extractAgentMessages } from "./extractAgentMessages.js";

export type SendLineChatMessageResult = {
	session: LineChatSession;
	snapshot: MarkdownFileSnapshot;
};

export type SendLineChatMessageOptions = {
	onUpdate?: (session: LineChatSession) => void;
};

/**
 * Appends a user turn, applies supported file edits, and records refreshed context metadata.
 */
export async function sendLineChatMessage(ctx: ExtensionCommandContext, snapshot: MarkdownFileSnapshot, session: LineChatSession, content: string, options: SendLineChatMessageOptions = {}): Promise<SendLineChatMessageResult> {
	if (!content.trim()) return { session, snapshot };
	const now = new Date().toISOString();
	const sessionPath = await getLineChatSessionPath(ctx.sessionManager.getSessionDir(), snapshot.filePath, session.metadata.lineNumber);
	await prepareLineChatSessionFile(sessionPath);
	const hiddenSessionManager = SessionManager.open(sessionPath, ctx.sessionManager.getSessionDir(), ctx.cwd);
	const resourceLoader = new DefaultResourceLoader({
		cwd: ctx.cwd,
		agentDir: getAgentDir(),
		systemPromptOverride: (base) => [base, createLineChatSystemPrompt(snapshot, session.metadata.lineNumber)].filter(Boolean).join("\n\n"),
	});
	await resourceLoader.reload();
	const { session: agentSession } = await createAgentSession({
		cwd: ctx.cwd,
		model: ctx.model,
		modelRegistry: ctx.modelRegistry,
		resourceLoader,
		sessionManager: hiddenSessionManager,
	});
	const unsubscribe = agentSession.subscribe(() => {
		const liveMessages = extractAgentMessages(agentSession.messages);
		options.onUpdate?.({ ...session, messages: liveMessages.length > 0 ? liveMessages : [...session.messages, { role: "user", content, timestamp: new Date().toISOString() }] });
	});
	await agentSession.prompt(content);
	unsubscribe();
	agentSession.dispose();
	const activeSnapshot = await readFile(snapshot.filePath, "utf8").then((fileContent) => computeMarkdownFileSnapshot(snapshot.filePath, fileContent));
	const messages = extractAgentMessages(hiddenSessionManager.buildSessionContext().messages);
	const next: LineChatSession = {
		...session,
		metadata: {
			...session.metadata,
			lineText: activeSnapshot.lines[session.metadata.lineNumber - 1] ?? "",
			lineFingerprint: createLineFingerprint(activeSnapshot.lines, session.metadata.lineNumber),
			lastContextContentHash: activeSnapshot.contentHash,
			lastContextMtimeMs: activeSnapshot.mtimeMs,
			updatedAt: now,
		},
		messages,
	};
	await persistLineChatSession(ctx.sessionManager.getSessionDir(), next);
	return { session: next, snapshot: activeSnapshot };
}
