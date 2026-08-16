import type { NexusLaunchSpec } from "@nexus/runtime";
/**
 * Creates a Nexus launch spec suitable for cmux restoration.
 *
 * @param args Nexus CLI args to pass on restore.
 * @returns Launch spec using the npm wrapper when available.
 */
export declare function createNexusRestoreLaunchSpec(args: string[]): NexusLaunchSpec;
