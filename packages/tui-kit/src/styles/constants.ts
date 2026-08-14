/**
 * Shared ANSI reset sequence for nexus-owned UI colors.
 */
export const RESET = "\x1b[0m";

/**
 * Default context-meter foreground color (neutral gray).
 */
export const CONTEXT_FG = "\x1b[38;2;190;190;190m";

/**
 * Context-meter OK color (teal) — usage below 33.33%.
 */
export const CONTEXT_OK_FG = "\x1b[38;2;125;214;198m";

/**
 * Context-meter warning color (amber) — usage 33.33%–66.66%.
 */
export const CONTEXT_WARN_FG = "\x1b[38;2;230;170;80m";

/**
 * Context-meter danger color (red) — usage above 66.66%.
 */
export const CONTEXT_DANGER_FG = "\x1b[38;2;210;90;90m";
