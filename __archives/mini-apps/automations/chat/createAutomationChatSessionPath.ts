import { join } from "node:path";

/**
 * Resolves the hidden session path used by automation editor chat.
 *
 * @param parentSessionDir Current interactive session directory.
 * @param automationId Automation id.
 * @returns Hidden chat session path.
 */
export function createAutomationChatSessionPath(parentSessionDir: string, automationId: string): string {
	return join(parentSessionDir, "automations", `${automationId}.jsonl`);
}
