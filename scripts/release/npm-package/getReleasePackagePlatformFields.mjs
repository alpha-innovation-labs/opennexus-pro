import { getReleaseTargetOptions } from "../binary/getReleaseTargetOptions.mjs";

/**
 * Returns npm package platform fields for the active release target.
 *
 * @returns {{ os: string[], cpu: string[] }} Npm os/cpu fields.
 */
export function getReleasePackagePlatformFields() {
  const targetOptions = getReleaseTargetOptions();
  return {
    os: targetOptions.npmOs ?? [process.platform],
    cpu: targetOptions.npmCpu ?? [process.arch],
  };
}
