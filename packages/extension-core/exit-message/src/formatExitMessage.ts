import { formatPurpleBox } from "./formatPurpleBox";
import { styleExitCommand, styleExitTitle } from "./styleExitCommand";

export interface ExitMessageDetails {
	sessionId?: string;
	title?: string;
}

/**
 * Formats the exit message for the current session.
 *
 * @param details Current session details.
 * @returns User-facing exit message.
 */
export function formatExitMessage(details: ExitMessageDetails): string {
	const sessionReference = details.sessionId?.trim() || "unknown-session";
	const sessionTitle = details.title?.trim() || "Untitled session";
	return formatPurpleBox([
		{ text: "This session's title is:" },
		{ text: sessionTitle, style: styleExitTitle },
		{ text: "" },
		{ text: "To resume this session, run:" },
		{ text: `nexus --resume ${sessionReference}`, style: styleExitCommand },
	]);
}
