type ToolSourceInfo = {
	path?: string;
	source?: string;
};

const PROJECT_SOURCE_NAMES = new Set([
	"project",
	"user",
	"temporary",
	"top-level",
]);

/**
 * Formats a tool source into the visible /tools group label.
 *
 * @param sourceInfo Source metadata attached to the tool.
 * @returns Group label for the tool list.
 */
export function formatToolGroupLabel(
	sourceInfo: ToolSourceInfo | undefined,
): string {
	if (!sourceInfo) return "Core";
	if (isCoreToolSource(sourceInfo)) return "Core";
	return formatExtensionToolGroupLabel(selectExtensionSource(sourceInfo));
}

/**
 * Detects tool sources that should be grouped as Core.
 *
 * @param sourceInfo Tool source metadata.
 * @returns True when the tool is built in or source metadata is unavailable.
 */
function isCoreToolSource(sourceInfo: ToolSourceInfo): boolean {
	const source = sourceInfo.source ?? "";
	const path = sourceInfo.path ?? "";
	return (
		source.length === 0 ||
		source === "builtin" ||
		source === "core" ||
		path.startsWith("builtin:") ||
		path.includes("/core/tools/")
	);
}

/**
 * Selects the best source string for extension grouping.
 *
 * @param sourceInfo Tool source metadata.
 * @returns Source string suitable for display formatting.
 */
function selectExtensionSource(sourceInfo: ToolSourceInfo): string {
	const source = sourceInfo.source ?? "";
	const path = sourceInfo.path ?? "";
	if (
		path.length > 0 &&
		(PROJECT_SOURCE_NAMES.has(source) || source.length === 0)
	)
		return selectPathSegment(path);
	return source || selectPathSegment(path) || "Extension";
}

/**
 * Selects a meaningful extension folder or filename from a source path.
 *
 * @param path Source file path.
 * @returns Extension-ish path segment.
 */
function selectPathSegment(path: string): string {
	const segments = path.split(/[\\/]+/u).filter(Boolean);
	const vendorIndex = segments.lastIndexOf("vendor");
	if (vendorIndex >= 0 && segments[vendorIndex + 1])
		return segments[vendorIndex + 1] as string;
	const srcIndex = segments.lastIndexOf("src");
	if (srcIndex >= 0 && segments[srcIndex + 1])
		return segments[srcIndex + 1] as string;
	return segments.at(-1) ?? path;
}

/**
 * Converts an extension source identifier into a readable title.
 *
 * @param source Raw source or path value.
 * @returns Human-readable extension group label.
 */
function formatExtensionToolGroupLabel(source: string): string {
	const tail =
		source.replace(/^npm:/u, "").split(/[/:]/u).filter(Boolean).at(-1) ??
		source;
	return (
		tail
			.replace(/^register-/u, "")
			.replace(/-extension$/u, "")
			.replace(/\.js$/u, "")
			.replace(/\.ts$/u, "")
			.split(/[-_\s]+/u)
			.filter(Boolean)
			.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
			.join(" ") || "Extension"
	);
}
