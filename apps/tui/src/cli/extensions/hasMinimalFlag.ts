/** CLI flags that activate minimal mode. */
const MINIMAL_FLAGS = new Set(["--minimal", "-m"]);

/** Minimal extension whitelist — only these extensions are loaded in minimal mode. */
export const MINIMAL_EXTENSION_WHITELIST = [
  "ai-providers",
  "exit-message",
  "feature-management",
  "fff",
  "neo-editor",
  "observations",
  "slash-menu",
  "startup-hero",
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
