/**
 * RTK gain summary fields consumed by Nexus savings rendering.
 */
export interface RtkGainSummary {
	total_commands: number;
	total_input: number;
	total_output: number;
	total_saved: number;
	avg_savings_pct: number;
	total_time_ms: number;
	avg_time_ms: number;
}
