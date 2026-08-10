import { CMUX_SESSION_REGISTRY_LOCK_RETRY_MS } from "./cmuxSessionRegistryLockConstants";

/**
 * Waits before retrying a contended cmux registry lock acquisition.
 */
export async function waitForCmuxSessionRegistryLockRetry(): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, CMUX_SESSION_REGISTRY_LOCK_RETRY_MS));
}
