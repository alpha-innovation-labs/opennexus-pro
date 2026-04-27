/**
 * Returns RTK arguments for machine-readable gain output.
 *
 * @returns Arguments for `rtk gain --daily --weekly --monthly --format json`.
 */
export function getRtkGainJsonArgs(): string[] {
  return ["--daily", "--weekly", "--monthly", "--format", "json"];
}
