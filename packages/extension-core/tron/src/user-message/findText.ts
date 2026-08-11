/**
 * Finds the first text value inside a rendered user-message tree.
 *
 * @param node Render tree node.
 * @returns First discovered text value.
 */
export function findText(node: unknown): string {
	if (!node) return "";
	if (typeof node.text === "string") return node.text;
	if (!Array.isArray(node.children)) return "";
	for (const child of node.children) {
		const text = findText(child);
		if (text) return text;
	}
	return "";
}
