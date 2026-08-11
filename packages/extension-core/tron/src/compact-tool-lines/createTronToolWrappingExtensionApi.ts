import type {
	ExtensionAPI,
	ToolDefinition,
} from "@earendil-works/pi-coding-agent";
import { createCompactToolDefinition } from "./createCompactToolDefinition";
import { isCompactWrappedToolDefinition } from "./isCompactWrappedToolDefinition";

/**
 * Creates an extension API proxy that gives every registered tool Tron compact rendering.
 *
 * @param pi Original extension API.
 * @returns Extension API with registerTool wrapping enabled.
 */
export function createTronToolWrappingExtensionApi(
	pi: ExtensionAPI,
): ExtensionAPI {
	return new Proxy(pi, {
		get(target, property, receiver) {
			if (property === "registerTool") {
				return (definition: ToolDefinition<unknown, unknown, unknown>) => {
					const compactDefinition = isCompactWrappedToolDefinition(definition)
						? definition
						: createCompactToolDefinition(definition);
					return target.registerTool(compactDefinition as never);
				};
			}
			return Reflect.get(target, property, receiver);
		},
	});
}
