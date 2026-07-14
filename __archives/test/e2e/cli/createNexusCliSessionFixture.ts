import { createNexusCliSessionFixtureForCwd } from "./createNexusCliSessionFixtureForCwd.js";

/**
 * Creates one persisted Nexus session fixture inside a temporary HOME directory.
 *
 * @param homeDir Temporary HOME directory for the test run.
 * @returns Session directory, ID, and file path.
 */
export async function createNexusCliSessionFixture(homeDir: string): Promise<{ sessionDir: string; sessionId: string; sessionPath: string }> {
  return createNexusCliSessionFixtureForCwd(homeDir, process.cwd(), "CLI resume fixture");
}
