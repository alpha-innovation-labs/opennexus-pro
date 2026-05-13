import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

export type RegisteredSlashCommand = {
  name: string;
  description?: string;
  source?: "builtin" | "extension" | "prompt" | "skill";
  sourceInfo?: { path?: string; scope?: "project" | "user" | "temporary" };
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
  groupHeaderDescription?: string;
  options?: string[];
  sourcePath?: string;
  sourceScope?: "project" | "user" | "temporary";
  preserveLabelWhitespace?: boolean;
  resumeAge?: string;
  resumeRow?: boolean;
  wrapPreservedLabel?: boolean;
  wrapToFit?: boolean;
  fixedLabelWidth?: number;
};

export type SlashMenuSection = {
  label: string;
  description: string;
  value: string;
  groupLabel?: string;
  groupHeaderDescription?: string;
  preserveLabelWhitespace?: boolean;
  resumeAge?: string;
  resumeRow?: boolean;
  wrapPreservedLabel?: boolean;
  wrapToFit?: boolean;
  fixedLabelWidth?: number;
};
