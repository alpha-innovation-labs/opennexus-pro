import { getControlKeyFilterToken } from "./getControlKeyFilterToken.js";
import { getPrintableKeyFilterToken } from "./getPrintableKeyFilterToken.js";
import { getSpecialKeyFilterToken } from "./getSpecialKeyFilterToken.js";

/**
 * Converts one raw keypress into a which-key filter token.
 *
 * @param data Raw terminal input.
 * @returns Filter token for key search, when recognized.
 */
export function getWhichKeyFilterToken(data: string): string | undefined {
  return getSpecialKeyFilterToken(data) ?? getControlKeyFilterToken(data) ?? getPrintableKeyFilterToken(data);
}
