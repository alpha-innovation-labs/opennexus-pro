import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

export type RegisteredSlashCommand = {
  name: string;
  description?: string;
  source?: "builtin" | "extension" | "prompt" | "skill";
  hidden?: boolean;
  handler?: (args: string, ctx: ExtensionCommandContext) => unknown;
};

export type SlashMenuLeaf = {
  kind: "command" | "toggle" | "theme" | "setting" | "model" | "session" | "entry" | "provider" | "choice";
  label: string;
  description: string;
  value: string;
  currentValue?: string;
  options?: string[];
};

export type SlashMenuSection = {
  label: string;
  description: string;
  value: string;
};
