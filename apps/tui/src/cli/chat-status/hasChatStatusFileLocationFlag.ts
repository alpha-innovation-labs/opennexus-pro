const CHAT_STATUS_FILE_LOCATION_FLAG = "--chat-status-file-location";

/**
 * Checks whether the CLI should print the chat-status file location.
 *
 * @param argv Raw process arguments.
 * @returns True when the chat-status file location flag is present.
 */
export function hasChatStatusFileLocationFlag(argv: string[]): boolean {
  return argv.includes(CHAT_STATUS_FILE_LOCATION_FLAG);
}
