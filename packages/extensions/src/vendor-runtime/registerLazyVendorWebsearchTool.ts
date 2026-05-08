import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { executeLazyVendorWebsearchTool } from "./createLazyVendorWebsearchToolExecutor.js";

/**
 * Registers one startup-light websearch tool that loads the vendored implementation on use.
 *
 * @param pi Pi extension API.
 * @param name Tool name.
 * @param label Tool label.
 * @param description Tool description.
 */
export function registerLazyVendorWebsearchTool(
	pi: ExtensionAPI,
	name: string,
	label: string,
	description: string,
): void {
	pi.registerTool({
		name,
		label,
		description,
		parameters: Type.Object({}, { additionalProperties: true }),
		async execute(...args: unknown[]) {
			return executeLazyVendorWebsearchTool(name, args);
		},
	});
}
