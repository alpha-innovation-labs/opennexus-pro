/**
 * Returns the prefix of a string visible at the current streaming frame.
 *
 * @param text Full text to stream.
 * @param localFrame Scene-local frame.
 * @param startFrame Frame where streaming starts.
 * @param framesPerCharacter Number of frames per character.
 * @returns Visible text prefix.
 */
export function getStreamedText(text: string, localFrame: number, startFrame: number, framesPerCharacter: number): string {
  const visibleCharacters = Math.max(0, Math.floor((localFrame - startFrame) / framesPerCharacter));
  return text.slice(0, visibleCharacters);
}
