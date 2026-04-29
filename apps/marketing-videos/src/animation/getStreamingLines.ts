/**
 * Streams a list of lines as one newline-delimited text block.
 *
 * @param lines Full lines to stream.
 * @param localFrame Scene-local frame.
 * @param startFrame Frame where streaming starts.
 * @param framesPerCharacter Number of frames per character.
 * @returns Partially streamed lines.
 */
export function getStreamingLines(lines: string[], localFrame: number, startFrame: number, framesPerCharacter: number): string[] {
  const text = lines.join("\n");
  const visibleCharacters = Math.max(0, Math.floor((localFrame - startFrame) / framesPerCharacter));
  const visible = text.slice(0, visibleCharacters);
  return visible.length > 0 ? visible.split("\n") : [];
}
