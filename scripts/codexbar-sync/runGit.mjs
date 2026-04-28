import { execFileSync } from "node:child_process";

/**
 * Runs a git command and returns trimmed stdout.
 *
 * @param {string[]} args Git arguments.
 * @param {string} cwd Working directory.
 * @returns {string} Command output.
 */
export function runGit(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
}
