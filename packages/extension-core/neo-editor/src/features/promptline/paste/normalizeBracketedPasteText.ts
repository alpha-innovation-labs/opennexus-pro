/**
 * Normalizes bracketed paste text for direct promptline insertion.
 *
 * @param text Raw bracketed paste payload.
 * @returns Text with CSI-u control encodings restored and unsafe control bytes removed.
 */
export function normalizeBracketedPasteText(text: string): string {
  const decodedText = text.replace(/\x1b\[(\d+);5u/g, (match, code) => {
    const codePoint = Number(code);
    if (codePoint >= 97 && codePoint <= 122) return String.fromCharCode(codePoint - 96);
    if (codePoint >= 65 && codePoint <= 90) return String.fromCharCode(codePoint - 64);
    return match;
  });
  return decodedText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, "    ")
    .split("")
    .filter((char) => char === "\n" || char.charCodeAt(0) >= 32)
    .join("");
}
