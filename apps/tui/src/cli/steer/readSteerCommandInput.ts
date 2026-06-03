export interface SteerCommandInput {
  sessionId?: string;
  message?: string;
}

/**
 * Reads the session id and message from a steering CLI command.
 *
 * @param argv Raw CLI arguments.
 * @returns Parsed steering command input.
 */
export function readSteerCommandInput(argv: readonly string[]): SteerCommandInput {
  const [, sessionId, ...messageParts] = argv;
  return {
    sessionId,
    message: messageParts.join(" ").trim() || undefined,
  };
}
