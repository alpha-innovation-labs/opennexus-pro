import { getReleaseTargetOptions } from "../binary/getReleaseTargetOptions.mjs";

/**
 * Returns runtime npm dependencies for the active release package target.
 *
 * @param {Record<string, string>} dependencies Root package dependencies.
 * @returns {Record<string, string>} Release package dependencies.
 */
export function getReleasePackageDependencies(dependencies) {
  const targetOptions = getReleaseTargetOptions();
  const releaseDependencies = {
    "@ff-labs/fff-node": dependencies["@ff-labs/fff-node"],
    "@xterm/headless": dependencies["@xterm/headless"],
    linkedom: dependencies.linkedom,
    turndown: dependencies.turndown,
  };
  if (targetOptions.platform !== "linux") releaseDependencies["node-pty"] = dependencies["node-pty"];
  return releaseDependencies;
}
