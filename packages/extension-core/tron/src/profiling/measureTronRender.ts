import { recordTronRenderTiming } from "./recordTronRenderTiming";

/**
 * Measures one Tron render operation and records aggregate timing.
 *
 * @param name Render path name.
 * @param render Render callback.
 * @param data Extra diagnostic data.
 * @returns Render callback result.
 */
export function measureTronRender<T extends string[]>(
	name: string,
	render: () => T,
	data: Record<string, unknown> = {},
): T {
	const startedAt = performance.now();
	const lines = render();
	recordTronRenderTiming(
		name,
		performance.now() - startedAt,
		lines.length,
		data,
	);
	return lines;
}
