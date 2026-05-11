import type { AuthCredential } from "@earendil-works/pi-coding-agent";

export type AuthImportCandidate = {
	readonly providerId: string;
	readonly displayName: string;
	readonly credential: AuthCredential;
	readonly sourceProviderId: string;
};
