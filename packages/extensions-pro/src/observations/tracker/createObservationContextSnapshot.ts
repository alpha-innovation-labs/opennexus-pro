import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

export interface ObservationContextSnapshot {
	cwd: string;
	model?: { provider?: string; id?: string };
}

/**
 * Captures stable observation context fields before queued async work can outlive the Pi context.
 *
 * @param ctx Live Pi extension context.
 * @returns Immutable context fields safe to reuse in queued observation tasks.
 */
export function createObservationContextSnapshot(ctx: ExtensionContext): ObservationContextSnapshot {
	return {
		cwd: ctx.cwd,
		model: ctx.model ? { provider: ctx.model.provider, id: ctx.model.id } : undefined,
	};
}
