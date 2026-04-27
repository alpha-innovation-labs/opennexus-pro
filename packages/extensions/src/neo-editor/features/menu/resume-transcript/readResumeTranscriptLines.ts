import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { renderSubagentTranscriptLines } from "../../../../sub-agents/ui/renderSubagentTranscriptLines.js";
import { toSessionTranscriptEntries } from "./toSessionTranscriptEntries.js";

/**
 * Reads and renders one resumable session preview using the shared /agents transcript renderer.
 *
 * @param theme Active UI theme.
 * @param width Available preview width.
 * @param sessionPath Absolute persisted session path.
 * @returns Rendered transcript lines.
 */
export function readResumeTranscriptLines(
  theme: ExtensionCommandContext["ui"]["theme"],
  width: number,
  sessionPath: string,
): string[] {
  const transcript = toSessionTranscriptEntries(sessionPath);
  return renderSubagentTranscriptLines(theme, width, { transcript } as never);
}
