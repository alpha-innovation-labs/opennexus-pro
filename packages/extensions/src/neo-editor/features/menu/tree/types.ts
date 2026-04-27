import type { SlashMenuLeaf } from "../types.js";

export type TreeNode = {
  entry: {
    id: string;
    type: string;
    parentId: string | null;
    label?: string;
    message?: {
      role?: string;
      content?: unknown;
      timestamp?: number;
      stopReason?: string;
      toolCallId?: string;
    };
  };
  children: TreeNode[];
};

export type FlatTreeNode = {
  entry: TreeNode["entry"];
  depth: number;
};

export type TreeConversationLeaf = SlashMenuLeaf & {
  treeParentUserId?: string;
  treeFocusEntryId?: string;
  treeRole: "user" | "thinking" | "tool";
};
