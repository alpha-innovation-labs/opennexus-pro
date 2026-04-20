/**
 * Resolves the sound hook command for desktop notifications.
 *
 * @param env Environment variables.
 * @param platform Runtime platform.
 * @returns Shell command to run, if any.
 */
export function getNotifySoundCommand(
	env: NodeJS.ProcessEnv = process.env,
	platform: NodeJS.Platform = process.platform,
): string | undefined {
	if (Object.prototype.hasOwnProperty.call(env, "NEXUS_NOTIFY_SOUND_CMD")) {
		const command = env.NEXUS_NOTIFY_SOUND_CMD?.trim();
		return command || undefined;
	}
	if (platform === "darwin") return "afplay /System/Library/Sounds/Submarine.aiff";
	return undefined;
}
