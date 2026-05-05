import { Agent } from "@cursor/sdk";

/**
 * Creates a local Cursor SDK agent rooted at the current repository.
 *
 * @param apiKey Cursor API key used by the SDK.
 * @param cwd Workspace directory for the local agent.
 * @returns Cursor SDK agent handle.
 */
export function createPlaygroundAgent(apiKey: string, cwd: string) {
  return Agent.create({
    apiKey,
    name: "Nexus Cursor SDK playground",
    model: { id: process.env.CURSOR_MODEL?.trim() || "composer-2" },
    local: { cwd },
  });
}
