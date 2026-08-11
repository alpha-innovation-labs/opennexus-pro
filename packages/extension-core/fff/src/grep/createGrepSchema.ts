import { Type } from "@sinclair/typebox";

/**
 * Creates the FFF-enhanced grep parameter schema.
 *
 * @returns TypeBox grep schema.
 */
export function createGrepSchema() {
	return Type.Object({
		pattern: Type.String({ description: "Search pattern" }),
		mode: Type.Optional(
			Type.String({ description: "Search mode: plain, regex, or fuzzy" }),
		),
		path: Type.Optional(
			Type.String({ description: "Optional exact or fuzzy file/folder scope" }),
		),
		glob: Type.Optional(
			Type.String({ description: "Optional glob filter such as *.ts" }),
		),
		ignoreCase: Type.Optional(
			Type.Boolean({ description: "Case-insensitive search" }),
		),
		literal: Type.Optional(
			Type.Boolean({
				description: "Treat pattern as literal string instead of regex",
			}),
		),
		context: Type.Optional(
			Type.Number({ description: "Context lines before and after each match" }),
		),
		limit: Type.Optional(
			Type.Number({ description: "Maximum number of matches to return" }),
		),
		cursor: Type.Optional(
			Type.String({ description: "Cursor from a previous grep result" }),
		),
	});
}
