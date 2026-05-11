import type { AuthCredential } from "@earendil-works/pi-coding-agent";
import type { AuthImportSource } from "../model/AuthImportSource.js";
import { normalizeOpenCodeCredential } from "./normalizeOpenCodeCredential.js";
import { normalizePiCredential } from "./normalizePiCredential.js";

/**
 * Normalizes an auth entry from a supported import source.
 *
 * @param source Import source identifier.
 * @param credential Raw credential entry.
 * @returns A Nexus-compatible credential, or undefined when invalid.
 */
export function normalizeImportCredential(source: AuthImportSource, credential: unknown): AuthCredential | undefined {
	return source === "pi" ? normalizePiCredential(credential) : normalizeOpenCodeCredential(credential);
}
