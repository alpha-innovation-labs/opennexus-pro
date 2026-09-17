/**
 * Token-per-second (TPS) tracker for streaming assistant responses.
 *
 * Tracks two metrics:
 * - Sliding-window TPS (default, real-time): sums tokens within the last 1000ms
 *   and divides by the clamped span (min 100ms).
 * - Overall average TPS (at streaming end): totalTokens / elapsedGeneratingSeconds.
 *
 * Timer pauses during non-generating tool calls (anything other than edit/write)
 * to avoid skewing.
 */

import { formatPromptlineTpsLabel } from "./formatPromptlineTpsLabel";

const TPS_WINDOW_MS = 1000;
const TPS_MIN_SPAN_MS = 100;
const TPS_COMPACT_EVERY = 5000;
const TPS_COMPACT_WINDOW_MS = TPS_WINDOW_MS * 2;

/**
 * A single delta entry recorded during streaming.
 */
export interface PromptlineTpsDelta {
	/** Unix timestamp in ms. */
	time: number;
	/** Token count for this delta. */
	tokens: number;
}

// Internal delta ring buffer
let deltas: PromptlineTpsDelta[] = [];
let totalTpsTokens = 0;
let generatingStart = 0;
let totalPausedMs = 0;
let pauseStart = 0;

// Streaming state
let isGenerating = false;
let lastLiveTps = 0;
let lastAverageTps = 0;
let tpsRenderRequest: (() => void) | null = null;
let tpsRefreshInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Sets a render trigger callback that will be called periodically during streaming.
 * Used to update the TPS badge in real time.
 *
 * @param request Render request function.
 */
export function setPromptlineRefreshRequest(
	request: (() => void) | null,
): void {
	tpsRenderRequest = request;
	if (request) {
		startTpsRefresh();
	} else {
		stopTpsRefresh();
	}
}

/**
 * Starts periodic TPS badge refresh during streaming.
 * Refreshes every 500ms while generating.
 */
function startTpsRefresh(): void {
	if (tpsRefreshInterval) return;
	tpsRefreshInterval = setInterval(() => {
		if (isGenerating && tpsRenderRequest) {
			tpsRenderRequest();
		}
	}, 500);
}

/**
 * Stops periodic TPS badge refresh.
 */
function stopTpsRefresh(): void {
	if (tpsRefreshInterval) {
		clearInterval(tpsRefreshInterval);
		tpsRefreshInterval = null;
	}
}

/**
 * Pauses the TPS timer when a non-generating tool call begins.
 */
export function pauseTpsTimer(): void {
	if (!isGenerating) return;
	if (pauseStart > 0) return;
	pauseStart = Date.now();
}

/**
 * Resumes the TPS timer after a non-generating tool call finishes.
 * Accumulates the pause duration to subtract from effective elapsed time.
 */
export function resumeTpsTimer(): void {
	if (pauseStart === 0 || !isGenerating) return;
	totalPausedMs += Date.now() - pauseStart;
	pauseStart = 0;
}

/**
 * Clears the paused elapsed accumulator when the overall turn ends.
 */
export function resetTurnPauseAccumulator(): void {
	pauseStart = 0;
	totalPausedMs = 0;
}

/**
 * Records a streaming delta with token count.
 *
 * @param tokenCount Tokens contributed by this delta (1 by default, or estimated).
 */
export function recordTpsDelta(tokenCount: number = 1): void {
	const now = Date.now();
	if (!isGenerating) {
		isGenerating = true;
		generatingStart = now;
	}
	deltas.push({ time: now, tokens: tokenCount });
	totalTpsTokens += tokenCount;

	// Compact old entries every 5000 events to bound memory
	if (deltas.length > TPS_COMPACT_EVERY) {
		const cutoff = now - TPS_COMPACT_WINDOW_MS;
		deltas = deltas.filter((d) => d.time >= cutoff);
	}
}

/**
 * Signals that the overall turn / streaming session has ended.
 * Resets the sliding-window tracker for the next turn.
 * Stores the final TPS so it persists in the UI.
 */
export function endTpsStreaming(): void {
	if (!isGenerating) return;
	lastLiveTps = Math.round(getSlidingWindowTps());
	lastAverageTps = Math.round(getAverageTps());
	isGenerating = false;
	pauseStart = 0;
	totalPausedMs = 0;
	totalTpsTokens = 0;
}

/**
 * Resets the entire TPS tracker for a new streaming session.
 */
export function resetTpsTracker(): void {
	deltas = [];
	totalTpsTokens = 0;
	generatingStart = 0;
	pauseStart = 0;
	totalPausedMs = 0;
	lastLiveTps = 0;
	lastAverageTps = 0;
	isGenerating = false;
}

/**
 * Computes the effective elapsed generating time excluding pauses.
 *
 * @returns Elapsed seconds during which TPS was being recorded.
 */
function getEffectiveElapsedSeconds(): number {
	if (generatingStart === 0) return 0;
	let elapsed = Date.now() - generatingStart;
	elapsed = Math.max(0, elapsed - totalPausedMs);
	if (pauseStart > 0) {
		elapsed = Math.max(0, elapsed - (Date.now() - pauseStart));
	}
	return elapsed / 1000;
}

/**
 * Computes the current sliding-window TPS.
 *
 * Sums all tokens whose timestamps fall within the last windowMs.
 * TPS = (windowTokens * 1000) / clampedSpan, where span = clamp(rawSpan, minSpanMs).
 * The 100ms clamp prevents burst spikes from producing unrealistically high TPS.
 *
 * @returns Computed TPS as a number, or 0 when insufficient data.
 */
export function getSlidingWindowTps(): number {
	if (!isGenerating || deltas.length < 2) return 0;

	const now = Date.now();
	const cutoff = now - TPS_WINDOW_MS;
	let windowTokens = 0;
	let oldestInWindow = now;

	for (let i = deltas.length - 1; i >= 0; i--) {
		const d = deltas[i];
		if (d.time <= cutoff) break;
		windowTokens += d.tokens;
		oldestInWindow = d.time;
	}

	const spanMs = Math.max(TPS_MIN_SPAN_MS, now - oldestInWindow);
	return (windowTokens * 1000) / spanMs;
}

/**
 * Returns the overall average TPS from generating start to now.
 * Computed as totalTpsTokens / effectiveGeneratingSeconds.
 */
export function getAverageTps(): number {
	if (totalTpsTokens === 0 || generatingStart === 0) return 0;
	const elapsedSec = getEffectiveElapsedSeconds();
	if (elapsedSec < 0.1) return 0;
	return totalTpsTokens / elapsedSec;
}

/**
 * Formats a TPS label for display in the promptline status widget.
 *
 * @returns Live and average TPS, preserved independently after streaming ends.
 */
export function getPromptlineTpsLabel(): string {
	return formatPromptlineTpsLabel(
		isGenerating ? Math.round(getSlidingWindowTps()) : lastLiveTps,
		isGenerating ? Math.round(getAverageTps()) : lastAverageTps,
	);
}
