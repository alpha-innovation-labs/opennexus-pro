import type { AutomationRecord, AutomationRunRecord } from "../core/storage/types.js";

/** Chat message displayed in the automation editor. */
export type AutomationChatMessage = {
	role: "user" | "assistant" | "system";
	content: string;
	createdAt: string;
};

/** Automation update emitted by the editor agent. */
export type AutomationAgentUpdate = {
	name?: string;
	scheduleText?: string;
	prompt?: string;
	cwd?: string;
	enabled?: boolean;
};

/** Automation editor chat transport. */
export type AutomationChatSender = (automation: AutomationRecord, messages: AutomationChatMessage[], input: string, onUpdate: (messages: AutomationChatMessage[]) => void) => Promise<{ automation: AutomationRecord; messages: AutomationChatMessage[] }>;

/** Returns latest run rows for an automation id. */
export type AutomationRunSummaryProvider = (automationId: string) => AutomationRunRecord[];
