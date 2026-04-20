import { homedir } from "node:os";

/**
 * Expands a leading tilde in one path.
 *
 * @param value Path that may begin with `~`.
 * @returns Expanded absolute-like path.
 */
export function expandHomePath(value: string): string {
  if (value === "~") {
    return homedir();
  }

  if (value.startsWith("~/")) {
    return `${homedir()}${value.slice(1)}`;
  }

  return value;
}
