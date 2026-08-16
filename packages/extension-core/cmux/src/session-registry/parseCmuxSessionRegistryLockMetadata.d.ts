import type { CmuxSessionRegistryLockMetadata } from "./CmuxSessionRegistryLockMetadata";
/**
 * Parses untrusted cmux registry lock owner metadata.
 *
 * @param value Parsed JSON value.
 * @returns Valid lock metadata, when present.
 */
export declare function parseCmuxSessionRegistryLockMetadata(value: unknown): CmuxSessionRegistryLockMetadata | undefined;
