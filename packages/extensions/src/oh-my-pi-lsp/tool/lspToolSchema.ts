import { StringEnum } from "@mariozechner/pi-ai";
import { Type } from "typebox";

/**
 * Creates the public schema for the in-house Oh My Pi LSP tool.
 *
 * @returns TypeBox-compatible tool parameter schema.
 */
export function lspToolSchema() {
	return Type.Object({
		action: StringEnum(["diagnostics", "definition", "type_definition", "implementation", "references", "hover", "symbols", "rename", "code_actions", "status", "capabilities", "request", "reload"] as const),
		file: Type.Optional(Type.String()),
		line: Type.Optional(Type.Number()),
		symbol: Type.Optional(Type.String()),
		query: Type.Optional(Type.String()),
		new_name: Type.Optional(Type.String()),
		apply: Type.Optional(Type.Boolean()),
		payload: Type.Optional(Type.String()),
		timeout: Type.Optional(Type.Number()),
	});
}
