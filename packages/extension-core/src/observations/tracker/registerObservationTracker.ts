import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { applyAssistantObservation } from "./applyAssistantObservation.js";
import { applyUserObservation } from "./applyUserObservation.js";
import { createEphemeralConversationId } from "./createEphemeralConversationId.js";
import { createObservationContextSnapshot } from "./createObservationContextSnapshot.js";
import { createStoredObservationMessage } from "./createStoredObservationMessage.js";
import { enqueueObservationTask } from "./enqueueObservationTask.js";
import { ensureObservationsDir } from "./ensureObservationsDir.js";
import { extractAssistantSummaryInput } from "./extractAssistantSummaryInput.js";
import { extractUserText } from "./extractUserText.js";
import { getObservationPaths } from "./getObservationPaths.js";
import { getStoredObservationState } from "./getStoredObservationState.js";
import { updateSessionTitleFromObservationState } from "./updateSessionTitleFromObservationState.js";
import { writeObservationState } from "./writeObservationState.js";

/**
 * Registers the observations tracking flow.
 *
 * @param pi Pi extension API.
 */
export function registerObservationTracker(pi: ExtensionAPI): void {
	const queues = new Map<string, Promise<void>>();
	let ephemeralConversationId = createEphemeralConversationId();
	logExtensionEvent("observations", "init");
	pi.on("session_start", async (event, ctx) => {
		if (!ctx.hasUI) return;
		logExtensionEvent("observations", "session_start", {
			reason: event.reason,
			sessionFile: ctx.sessionManager.getSessionFile() ?? null,
		});
		if (!ctx.sessionManager.getSessionFile()) ephemeralConversationId = createEphemeralConversationId();
		const { conversationId, statePath, dir, sessionFile } = getObservationPaths(ctx, ephemeralConversationId);
		await ensureObservationsDir(dir);
		const state = await getStoredObservationState(statePath, conversationId, ctx.cwd, sessionFile);
		await writeObservationState(statePath, state);
		await updateSessionTitleFromObservationState(pi, state);
	});
	pi.on("message_end", async (event, ctx) => {
		if (!ctx.hasUI) return;
		const paths = getObservationPaths(ctx, ephemeralConversationId);
		const contextSnapshot = createObservationContextSnapshot(ctx);
		await ensureObservationsDir(paths.dir);
		if (event.message.role === "user") {
			const text = extractUserText(event.message);
			if (!text) return;
			enqueueObservationTask(queues, paths.conversationId, async () => {
				const state = await getStoredObservationState(paths.statePath, paths.conversationId, contextSnapshot.cwd, paths.sessionFile);
				const stored = createStoredObservationMessage(state, {
					timestamp: event.message.timestamp ?? Date.now(),
					role: "user",
					text,
				});
				await applyUserObservation(pi, contextSnapshot, state, stored);
				await writeObservationState(paths.statePath, state);
				await updateSessionTitleFromObservationState(pi, state);
			});
			return;
		}
		if (event.message.role !== "assistant") return;
		const summaryInput = extractAssistantSummaryInput(event.message);
		if (!summaryInput.text && !summaryInput.thinking) return;
		enqueueObservationTask(queues, paths.conversationId, async () => {
			const state = await getStoredObservationState(paths.statePath, paths.conversationId, contextSnapshot.cwd, paths.sessionFile);
			const stored = createStoredObservationMessage(state, {
				timestamp: event.message.timestamp ?? Date.now(),
				role: "assistant",
				text: summaryInput.text,
				thinking: summaryInput.thinking,
			});
			await applyAssistantObservation(pi, contextSnapshot, state, stored);
			await writeObservationState(paths.statePath, state);
			await updateSessionTitleFromObservationState(pi, state);
		});
	});
	pi.on("turn_end", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		const { conversationId, statePath, sessionFile } = getObservationPaths(ctx, ephemeralConversationId);
		const state = await getStoredObservationState(statePath, conversationId, ctx.cwd, sessionFile);
		await updateSessionTitleFromObservationState(pi, state);
	});
	pi.on("session_shutdown", async (_event, ctx) => {
		logExtensionEvent("observations", "session_shutdown", {
			sessionFile: ctx.sessionManager.getSessionFile() ?? null,
		});
	});
}
