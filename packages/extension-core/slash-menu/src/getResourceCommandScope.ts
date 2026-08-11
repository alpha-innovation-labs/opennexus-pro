import { isAbsolute, relative, resolve } from "node:path";
import type { RegisteredSlashCommand, SlashMenuLeaf } from "./types";

/**
 * Resolves a command's resource scope from Pi source metadata.
 *
 * @param command Command or menu leaf.
 * @returns Local, global, or undefined for unknown/temporary sources.
 */
export function getResourceCommandScope(
	command: RegisteredSlashCommand | SlashMenuLeaf,
): "local" | "global" | undefined {
	const sourceInfo = "sourceInfo" in command ? command.sourceInfo : undefined;
	const scope =
		sourceInfo?.scope ??
		("sourceScope" in command ? command.sourceScope : undefined);
	if (scope === "project") return "local";
	if (scope === "user") return "global";
	const sourcePath =
		sourceInfo?.path ??
		("sourcePath" in command ? command.sourcePath : undefined);
	if (!sourcePath || sourcePath.startsWith("<")) return undefined;
	const relativePath = relative(process.cwd(), resolve(sourcePath));
	return relativePath &&
		!relativePath.startsWith("..") &&
		!isAbsolute(relativePath)
		? "local"
		: "global";
}
