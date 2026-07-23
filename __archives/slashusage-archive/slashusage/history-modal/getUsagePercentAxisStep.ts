/**
 * Selects the coarsest percent-axis step needed to fit available rows.
 *
 * @param availableRows Rows available for one title, chart, and time axis.
 * @returns Percent increment for y-axis labels.
 */
export function getUsagePercentAxisStep(availableRows: number): 5 | 10 | 50 {
	if (availableRows >= 23) return 5;
	if (availableRows >= 13) return 10;
	return 50;
}
