import type {
	FeatureFlagConfig,
	FeatureFlagsConfig,
	FeatureProductCategory,
} from "@nexus/feature-flags";
import { getFeatureManagementGroup } from "./getFeatureManagementGroup";
import type { FeatureStatusRow } from "./types";

/**
 * Sort order for group section headers.
 */
const GROUP_ORDER: Record<string, number> = {
	Core: 0,
	Nexus: 1,
	"Pi Packages": 2,
	"Mini apps": 3,
};

/**
 * Creates flattened feature rows with runtime status.
 * No channel column — just name, status, and group sections.
 *
 * Rows are sorted by group (Core → Nexus → Pi Packages → Mini apps)
 * then alphabetically by feature id within each group.
 *
 * @param config Static feature-flag config.
 * @param runtimeConfig Feature-flag config after runtime availability rules.
 * @param minimalWhitelist Extensions whitelisted by --minimal. Undefined means Core mode is disabled.
 * @returns One display row for each declared feature entry.
 */
export function createFeatureStatusRows(
	config: FeatureFlagsConfig,
	runtimeConfig: FeatureFlagsConfig,
	minimalWhitelist?: readonly string[],
): FeatureStatusRow[] {
	const rows = [
		...createCategoryFeatureStatusRows(
			"extensions",
			config.extensions,
			runtimeConfig.extensions,
			minimalWhitelist,
		),
		...createCategoryFeatureStatusRows(
			"other",
			config.other ?? {},
			runtimeConfig.other ?? config.other ?? {},
			minimalWhitelist,
		),
	];
	return rows.sort((a, b) => {
		const groupDiff =
			(GROUP_ORDER[a.group] ?? 99) - (GROUP_ORDER[b.group] ?? 99);
		return groupDiff !== 0 ? groupDiff : a.feature.localeCompare(b.feature);
	});
}

/**
 * Creates status rows for a single feature category.
 *
 * @param sourceCategory Source config category assigned to every row.
 * @param config Static category config.
 * @param runtimeConfig Runtime-adjusted category config.
 * @returns Display rows for the category.
 */
function createCategoryFeatureStatusRows(
	sourceCategory: "extensions" | "other",
	config: Record<string, FeatureFlagConfig>,
	runtimeConfig: Record<string, FeatureFlagConfig>,
	minimalWhitelist?: readonly string[],
): FeatureStatusRow[] {
	return Object.entries(config).map(([featureId, value]) => {
		const status = runtimeConfig[featureId]?.enabled ? "enabled" : "disabled";

		return {
			category: getFeatureStatusCategory(value.category),
			sourceCategory,
			extensionId: featureId,
			feature: featureId,
			status,
			group: getFeatureManagementGroup(featureId, minimalWhitelist),
		} satisfies FeatureStatusRow;
	});
}

/**
 * Maps persisted product category metadata to the modal tab category.
 *
 * @param category Optional product category from feature-flags config.
 * @returns Feature-management tab category.
 */
function getFeatureStatusCategory(
	category: FeatureProductCategory | undefined,
): "core" | "dev" | "pro" | "mini-apps" {
	if (category === "mini-app") return "mini-apps";
	if (category === "dev") return "dev";
	if (category === "pro") return "pro";
	return "core";
}
