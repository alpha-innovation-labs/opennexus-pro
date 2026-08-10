/**
 * RTK period savings row shared by daily, weekly, and monthly exports.
 */
export interface RtkGainPeriod {
  commands: number;
  input_tokens: number;
  output_tokens: number;
  saved_tokens: number;
  savings_pct: number;
  total_time_ms: number;
  avg_time_ms: number;
  date?: string;
  week_start?: string;
  week_end?: string;
  month?: string;
}
