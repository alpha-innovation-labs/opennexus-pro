import { formatPurpleBox, type PurpleBoxLine } from "./formatPurpleBox";
import { styleExitCommand, styleExitTitle } from "./styleExitCommand";

export interface ExitMessageDetails {
	sessionId?: string;
	title?: string;
	copiedToClipboard?: boolean;
}

/**
 * Builds the resume command for a session.
 *
 * @param sessionId Current session id.
 * @returns The `nexus --resume` command to run.
 */
export function getResumeCommand(sessionId?: string): string {
	const sessionReference = sessionId?.trim() || "unknown-session";
	return `nexus --resume ${sessionReference}`;
}

/**
 * Formats the exit message for the current session.
 *
 * @param details Current session details.
 * @returns User-facing exit message.
 */
export function formatExitMessage(details: ExitMessageDetails): string {
	const sessionTitle = details.title?.trim() || "Untitled session";
	const lines: PurpleBoxLine[] = [
		{ text: "This session's title is:" },
		{ text: sessionTitle, style: styleExitTitle },
		{ text: "" },
		{ text: "To resume this session, run:" },
		{ text: getResumeCommand(details.sessionId), style: styleExitCommand },
	];
	if (details.copiedToClipboard) {
		lines.push({ text: "" }, { text: "Copied to clipboard.", style: styleExitTitle });
	}
	return formatPurpleBox(lines);
}
