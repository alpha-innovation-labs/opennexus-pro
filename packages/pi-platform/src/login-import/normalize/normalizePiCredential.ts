import type { AuthCredential } from "@mariozechner/pi-coding-agent";
import { isFiniteNumber } from "../guards/isFiniteNumber.js";
import { isNonEmptyString } from "../guards/isNonEmptyString.js";
import { isRecord } from "../guards/isRecord.js";

/**
 * Normalizes one Pi auth.json entry for Nexus storage.
 *
 * @param credential Raw Pi credential entry.
 * @returns A Nexus-compatible credential, or undefined when invalid.
 */
export function normalizePiCredential(credential: unknown): AuthCredential | undefined {
	if (!isRecord(credential) || !isNonEmptyString(credential.type)) {
		return undefined;
	}
	if (credential.type === "api_key" && isNonEmptyString(credential.key)) {
		return { type: "api_key", key: credential.key };
	}
	if (
		credential.type === "oauth" &&
		isNonEmptyString(credential.access) &&
		isNonEmptyString(credential.refresh) &&
		isFiniteNumber(credential.expires)
	) {
		return credential as AuthCredential;
	}
	return undefined;
}
