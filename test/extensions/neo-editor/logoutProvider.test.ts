import assert from "node:assert/strict";
import test from "node:test";
import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { logoutProvider } from "../../../packages/extensions/src/neo-editor/features/menu/model/logoutProvider.js";

/**
 * Creates a minimal context fixture for provider logout.
 *
 * @returns Context fixture and recorded calls.
 */
function createContext(): { ctx: ExtensionContext; calls: string[] } {
	const calls: string[] = [];
	const ctx = {
		cwd: process.cwd(),
		modelRegistry: {
			authStorage: {
				logout: (providerId: string) => calls.push(`logout:${providerId}`),
			},
			refresh: () => calls.push("refresh"),
		},
	} as unknown as ExtensionContext;
	return { ctx, calls };
}

test("provider logout removes auth and refreshes model registry", () => {
	const { ctx, calls } = createContext();

	logoutProvider(ctx, "minimax", {
		getEnabledModels: () => ["minimax/model", "openai/model"],
		setEnabledModels: (patterns) => calls.push(`enabled:${patterns?.join(",") ?? "none"}`),
	});

	assert.deepEqual(calls, ["logout:minimax", "enabled:openai/model", "refresh"]);
});
