import { describe, expect, it } from "vitest";
import {
	bundledFeatureFlags,
	getAllBundledExtensionIds,
	isBundledExtension,
} from "../packages/feature-flags/src/registry";

import {
	hasMinimalFlag,
	MINIMAL_EXTENSION_WHITELIST,
} from "../packages/nexus-runtime/src/shared/minimal";

describe("bundled subagent replacement", () => {
	it.each(["--minimal", "-m"])("includes Tintin in %s mode", (flag) => {
		expect(hasMinimalFlag([flag])).toBe(true);
		const minimalFeatures = getAllBundledExtensionIds().filter((id) =>
			MINIMAL_EXTENSION_WHITELIST.includes(id),
		);
		expect(minimalFeatures).toContain("subagent-tintin");
		expect(MINIMAL_EXTENSION_WHITELIST).not.toContain("subagents");
	});

	it("exposes Tintin as an enabled feature", () => {
		expect(isBundledExtension("subagent-tintin")).toBe(true);
		expect(bundledFeatureFlags["subagent-tintin"]).toMatchObject({
			enabled: true,
			category: "extension",
		});
		expect(bundledFeatureFlags["subagent-tintin"].features).toContain(
			"subagent-workflows",
		);
	});

	it("does not expose the old Herdr subagents feature", () => {
		expect(isBundledExtension("subagents")).toBe(false);
		expect(getAllBundledExtensionIds()).not.toContain("subagents");
	});
});
