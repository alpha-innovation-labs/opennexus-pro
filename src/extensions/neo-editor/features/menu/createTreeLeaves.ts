import type { SlashMenuLeaf } from "./types.js";

type TreeNode = {
  entry: {
    id: string;
    type: string;
    parentId: string | null;
    label?: string;
    message?: { role?: string; content?: unknown; stopReason?: string };
  };
  children: TreeNode[];
};

type FlatTreeNode = {
  entry: TreeNode["entry"];
  depth: number;
};

/**
 * Builds tree navigation leaves from the current session tree.
 *
 * @param tree Session tree nodes.
 * @returns Tree leaves.
 */
export function createTreeLeaves(tree: TreeNode[]): SlashMenuLeaf[] {
  return flattenTree(tree)
    .filter((node) => isVisibleInDefaultTree(node.entry))
    .map((node) => ({
      kind: "entry",
      label: `${"  ".repeat(node.depth)}${formatTreeLabel(node.entry)}`,
      description: describeTreeEntry(node.entry),
      value: node.entry.id,
    }));
}

/**
 * Flattens a tree for slash-menu display.
 *
 * @param roots Session tree roots.
 * @returns Flat entries with depth.
 */
function flattenTree(roots: TreeNode[]): FlatTreeNode[] {
  const result: FlatTreeNode[] = [];
  const walk = (nodes: TreeNode[], depth: number): void => {
    for (const node of nodes) {
      result.push({ entry: node.entry, depth });
      walk(node.children, depth + 1);
    }
  };
  walk(roots, 0);
  return result;
}

/**
 * Applies Pi's default tree visibility rules.
 *
 * @param entry Session entry.
 * @returns True when the entry should be shown.
 */
function isVisibleInDefaultTree(entry: TreeNode["entry"]): boolean {
  return !["label", "custom", "model_change", "thinking_level_change", "session_info"].includes(entry.type);
}

/**
 * Formats one tree label for the left pane.
 *
 * @param entry Session entry.
 * @returns Short tree label.
 */
function formatTreeLabel(entry: TreeNode["entry"]): string {
  if (entry.type !== "message") return entry.type;
  const role = entry.message?.role ?? "message";
  return `${role}: ${describeTreeEntry(entry)}`;
}

/**
 * Describes one tree entry for the preview pane.
 *
 * @param entry Session entry.
 * @returns Preview text.
 */
function describeTreeEntry(entry: TreeNode["entry"]): string {
  if (entry.type !== "message") return entry.type;
  if (typeof entry.message?.content === "string") return entry.message.content.slice(0, 160);
  if (!Array.isArray(entry.message?.content)) return entry.message?.role ? `${entry.message.role} message` : "message";
  return entry.message.content
    .map((block) => (typeof block === "object" && block && "type" in block && (block as { type?: string }).type === "text" ? (block as { text?: string }).text ?? "" : ""))
    .join(" ")
    .slice(0, 160) || `${entry.message?.role ?? "message"} message`;
}
