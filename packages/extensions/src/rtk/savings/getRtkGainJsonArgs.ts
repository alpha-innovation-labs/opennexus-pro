/**
 * Returns RTK arguments for machine-readable gain output.
 *
 * @returns Arguments for `rtk gain --format json`.
 */
export function getRtkGainJsonArgs(): string[] {
  return ["--format", "json"];
}
