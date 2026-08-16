/**
 * Template resolver — pure function that replaces template variables in step commands.
 *
 * Supported template syntax:
 *   {{input-name}}  → resolved from inputs map (hyphens → underscores)
 *   <previous-output> → previousOutput
 *   <output:stepId> → outputs[stepId]
 *   {{item}}        → item (for foreach, configurable via input_var)
 *
 * Throws if a template variable can't be resolved.
 *
 * @packageDocumentation
 */

import type { TemplateContext } from "./types.js";

export function templateResolver(
	template: string,
	ctx: TemplateContext,
): string {
	let result = template;

	// 1. Replace {{input-name}} → resolved from inputs map
	result = result.replace(/\{\{([a-zA-Z_][a-zA-Z0-9_-]*)\}\}/g, (_match, name: string) => {
		if (name === "item") {
			if (ctx.item !== undefined) {
				return ctx.item;
			}
			throw new Error(`Template variable {{item}} not resolved — not in a foreach context`);
		}
		const key = name.replace(/-/g, "_");
		const value = ctx.inputs[key];
		if (value === undefined) {
			throw new Error(`Unresolved template variable {{${name}}} — input not provided`);
		}
		return value;
	});

	// 2. Replace <previous-output>
	result = result.replace(/<previous-output>/g, () => {
		if (ctx.previousOutput === null) {
			throw new Error(`<previous-output> not available — no preceding step output`);
		}
		return ctx.previousOutput;
	});

	// 3. Replace <output:stepId>
	result = result.replace(/<output:([a-zA-Z_][a-zA-Z0-9_-]*)>/g, (_match, stepId: string) => {
		const value = ctx.outputs[stepId];
		if (value === null || value === undefined) {
			throw new Error(`Unresolved template <output:${stepId}> — step output not available`);
		}
		return value;
	});

	return result;
}
