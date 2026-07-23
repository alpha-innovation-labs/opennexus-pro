import type { TokenUsageTotals } from "./TokenUsageTotals.js";

/**
 * Parsed usage entry from a session JSONL line.
 */
export interface SessionUsageLine {
  model: string | null;
  timestamp: Date;
  usage: TokenUsageTotals;
}

/**
 * Parses a JSONL line into a token usage entry when present.
 *
 * @param line Raw JSONL line.
 * @returns Usage entry, or null for non-usage lines.
 */
export function parseSessionUsageLine(line: string): SessionUsageLine | null {
  if (!line.includes('"usage"')) return null;

  let record: unknown;
  try {
    record = JSON.parse(line);
  } catch {
    return null;
  }

  if (!record || typeof record !== "object") return null;
  const message = (record as { message?: unknown }).message;
  if (!message || typeof message !== "object") return null;
  const usage = (message as { usage?: unknown }).usage;
  if (!usage || typeof usage !== "object") return null;

  const input = Number((usage as { input?: unknown }).input) || 0;
  const output = Number((usage as { output?: unknown }).output) || 0;
  const cacheRead = Number((usage as { cacheRead?: unknown }).cacheRead) || 0;
  const cacheWrite = Number((usage as { cacheWrite?: unknown }).cacheWrite) || 0;
  const total = Number((usage as { totalTokens?: unknown }).totalTokens) || input + output + cacheRead + cacheWrite;
  const timestampValue = (record as { timestamp?: unknown }).timestamp ?? (message as { timestamp?: unknown }).timestamp;
  const timestamp = parseTimestamp(timestampValue);
  if (!timestamp) return null;

  return { model: parseModel(message), timestamp, usage: { cacheRead, cacheWrite, input, output, total } };
}

/**
 * Parses a session timestamp value.
 *
 * @param value Timestamp field value.
 * @returns Date when valid.
 */
function parseTimestamp(value: unknown): Date | null {
  if (typeof value === "number") return new Date(value);
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Extracts the model identifier from a session message.
 *
 * @param message Session message object.
 * @returns Model id when available.
 */
function parseModel(message: object): string | null {
  const model = (message as { model?: unknown }).model;
  return typeof model === "string" && model.length > 0 ? model : null;
}
