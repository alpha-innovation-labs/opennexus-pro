import type { FlatTreeNode, TreeNode } from "./types.js";

/**
 * Flattens session tree nodes in display order.
 *
 * @param roots Root session tree nodes.
 * @returns Flat tree nodes with depth metadata.
 */
export function flattenTreeNodes(roots: TreeNode[]): FlatTreeNode[] {
  const result: FlatTreeNode[] = [];
  const pending = roots.map((node) => ({ node, depth: 0 })).reverse();
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current) continue;
    result.push({ entry: current.node.entry, depth: current.depth });
    for (const child of [...current.node.children].reverse()) {
      pending.push({ node: child, depth: current.depth + 1 });
    }
  }
  return result;
}
