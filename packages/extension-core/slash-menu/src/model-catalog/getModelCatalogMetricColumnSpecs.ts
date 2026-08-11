export type ModelCatalogMetricColumnSpec = {
	label: string;
	width: number;
};

/**
 * Gets shared metric column widths for All models header and rows.
 *
 * @returns Ordered model catalog metric columns.
 */
export function getModelCatalogMetricColumnSpecs(): ModelCatalogMetricColumnSpec[] {
	return [
		{ label: "Context", width: 11 },
		{ label: "In /M", width: 10 },
		{ label: "Out /M", width: 11 },
		{ label: "Ca in /M", width: 15 },
		{ label: "Ca out /M", width: 16 },
	];
}
