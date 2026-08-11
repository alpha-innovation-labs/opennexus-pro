import type { CmuxSessionRegistryLockMetadata } from "./CmuxSessionRegistryLockMetadata";

/**
 * Parses untrusted cmux registry lock owner metadata.
 *
 * @param value Parsed JSON value.
 * @returns Valid lock metadata, when present.
 */
export function parseCmuxSessionRegistryLockMetadata(
	value: unknown,
): CmuxSessionRegistryLockMetadata | undefined {
	if (!value || typeof value !== "object") return undefined;
	const metadata = value as Partial<CmuxSessionRegistryLockMetadata>;
	const pid = metadata.pid;
	const createdAt = metadata.createdAt;
	const nonce = metadata.nonce;
	if (metadata.version !== 1) return undefined;
	if (typeof pid !== "number" || !Number.isInteger(pid) || pid <= 0)
		return undefined;
	if (typeof createdAt !== "string" || Number.isNaN(Date.parse(createdAt)))
		return undefined;
	if (typeof nonce !== "string" || nonce.length === 0) return undefined;
	return { version: 1, pid, createdAt, nonce };
}
