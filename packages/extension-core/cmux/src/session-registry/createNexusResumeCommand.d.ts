export type NexusRestoreCommand = {
    command: string;
    args: string[];
    input: string;
};
/**
 * Creates the exact Nexus direct-resume command for a session.
 *
 * @param sessionId Nexus session id to resume.
 * @returns Structured command metadata and shell input.
 */
export declare function createNexusResumeCommand(sessionId: string): NexusRestoreCommand;
