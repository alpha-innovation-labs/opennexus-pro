import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

export type RegisteredSlashCommand = {
  name: string;
  description?: string;
  source?: "builtin" | "extension" | "prompt" | "skill";
  menuGroup?: string;
  hidden?: boolean;
  handler?: (args: string, ctx: ExtensionCommandContext) => unknown;
};

export type SlashMenuLeaf = {
  kind: "command" | "toggle" | "theme" | "setting" | "model" | "session" | "entry" | "provider" | "choice";
  label: string;
  description: string;
  value: string;
  currentValue?: string;
  groupLabel?: string;
  options?: string[];
  preserveLabelWhitespace?: boolean;
  resumeAge?: string;
  resumeRow?: boolean;
  wrapPreservedLabel?: boolean;
  treeParentUserId?: string;
  treeFocusEntryId?: string;
  treeRole?: "user" | "thinking" | "tool";
};

export type SlashMenuSection = {
  label: string;
  description: string;
  value: string;
  groupLabel?: string;
  preserveLabelWhitespace?: boolean;
  resumeAge?: string;
  resumeRow?: boolean;
  wrapPreservedLabel?: boolean;
};
