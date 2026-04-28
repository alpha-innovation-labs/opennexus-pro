import type { AuthCredential } from "@mariozechner/pi-coding-agent";

export type AuthImportCandidate = {
	readonly providerId: string;
	readonly displayName: string;
	readonly credential: AuthCredential;
	readonly sourceProviderId: string;
};
