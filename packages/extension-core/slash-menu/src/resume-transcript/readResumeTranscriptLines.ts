import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { renderTranscriptLines } from "@extensions/tron/transcript/renderTranscriptLines";
import { toSessionTranscriptEntries } from "./toSessionTranscriptEntries";

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
  return renderTranscriptLines(theme, width, { transcript });
}
