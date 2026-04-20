const CMUX_EXECUTABLE_ENV = "NEXUS_CMUX_BIN";

/**
 * Resolves the cmux executable path used by the integration.
 *
 * @returns Absolute or PATH-resolved cmux executable.
 */
export function getCmuxExecutablePath(): string {
	return process.env[CMUX_EXECUTABLE_ENV]?.trim() || "cmux";
}
