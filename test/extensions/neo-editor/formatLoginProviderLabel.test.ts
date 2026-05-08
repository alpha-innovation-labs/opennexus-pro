import assert from "node:assert/strict";
import test from "node:test";
import { formatLoginProviderLabel } from "../../../packages/extensions/src/slash-menu/formatLoginProviderLabel.js";
import type { SlashMenuLeaf } from "../../../packages/extensions/src/slash-menu/types.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates a provider leaf fixture.
 *
 * @param currentValue Optional provider state marker.
 * @returns Provider leaf fixture.
 */
function createProviderLeaf(currentValue?: string): SlashMenuLeaf {
	return {
		kind: "provider",
		label: "Anthropic",
		description: "anthropic",
		value: "anthropic",
		currentValue,
	};
}

test("configured login provider label colors the whole row accent", () => {
	const theme = createTestTheme();
	const label = formatLoginProviderLabel(createProviderLeaf("configured"), "◆", theme);

	assert.equal(label, theme.fg("accent", "◆ Anthropic"));
});

test("unconfigured login provider label keeps only the icon explicitly white", () => {
	const theme = createTestTheme();
	const label = formatLoginProviderLabel(createProviderLeaf(), "◇", theme);

	assert.equal(label, `${theme.fg("text", "◇")} Anthropic`);
});
