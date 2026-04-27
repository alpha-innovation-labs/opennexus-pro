/**
 * Checks whether the input is a plain trigger-start character.
 *
 * @param data Raw terminal input.
 * @returns True when the input is a trigger character.
 */
export function isTriggerTextStart(data: string): data is "@" | "/" {
  return data === "@" || data === "/";
}
