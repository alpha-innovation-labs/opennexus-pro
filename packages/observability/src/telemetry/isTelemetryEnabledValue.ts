/**
 * Checks whether an environment value explicitly enables telemetry.
 *
 * @param value Environment variable value to inspect.
 * @returns True when the value opts in to telemetry.
 */
export function isTelemetryEnabledValue(value: string | undefined): boolean {
  return value === "1" || value === "true" || value === "yes";
}
