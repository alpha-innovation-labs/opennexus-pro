/** CLI flags that activate minimal mode. */
export const MINIMAL_FLAGS = new Set(["--minimal", "-m"]);

/** Minimal extension whitelist — only these extensions are loaded in minimal mode. */
export const MINIMAL_EXTENSION_WHITELIST = [
  "ai-providers",
  "exit-message",
  "feature-management",
  "fff",
  "herdr-agent-end-log",
  "neo-editor",
  "observations",
  "slash-menu",
  "startup-hero",
  "subagents",
  "system-prompt",
  "tron",
];

/**
 * Reports whether argv requests minimal mode.
 *
 * @param argv Command-line arguments to inspect.
 * @returns True when the minimal flag is present.
 */
export function hasMinimalFlag(argv: string[]): boolean {
  return argv.some((arg) => MINIMAL_FLAGS.has(arg));
}
