import { writeTronProfileEvent } from "./writeTronProfileEvent.js";

type TronRenderTiming = {
  count: number;
  totalMs: number;
  maxMs: number;
  totalLines: number;
};

const timings = new Map<string, TronRenderTiming>();
const LOG_EVERY_CALLS = 100;
const SLOW_RENDER_MS = 8;

/**
 * Records aggregate timing for one Tron render path.
 *
 * @param name Render path name.
 * @param durationMs Elapsed render duration.
 * @param lines Rendered line count.
 * @param data Extra diagnostic data.
 */
export function recordTronRenderTiming(name: string, durationMs: number, lines: number, data: Record<string, unknown> = {}): void {
  const timing = timings.get(name) ?? { count: 0, totalMs: 0, maxMs: 0, totalLines: 0 };
  timing.count += 1;
  timing.totalMs += durationMs;
  timing.maxMs = Math.max(timing.maxMs, durationMs);
  timing.totalLines += lines;
  timings.set(name, timing);

  if (durationMs >= SLOW_RENDER_MS) {
    writeTronProfileEvent("render:slow", { name, durationMs, lines, ...data });
  }

  if (timing.count % LOG_EVERY_CALLS !== 0) return;
  writeTronProfileEvent("render:summary", {
    name,
    count: timing.count,
    totalMs: Number(timing.totalMs.toFixed(3)),
    avgMs: Number((timing.totalMs / timing.count).toFixed(3)),
    maxMs: Number(timing.maxMs.toFixed(3)),
    avgLines: Number((timing.totalLines / timing.count).toFixed(1)),
    ...data,
  });
}
