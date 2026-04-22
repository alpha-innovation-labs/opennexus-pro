import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

export type PromptlineDeps = {
  exec: ExtensionAPI["exec"];
  getThinkingLevel: ExtensionAPI["getThinkingLevel"];
  setThinkingLevel: ExtensionAPI["setThinkingLevel"];
  getSessionName: ExtensionAPI["getSessionName"];
};

export type PromptlineRefreshDeps = {
  exec: ExtensionAPI["exec"];
  getThinkingLevel?: ExtensionAPI["getThinkingLevel"];
  setThinkingLevel?: ExtensionAPI["setThinkingLevel"];
  getSessionName?: ExtensionAPI["getSessionName"];
};

export type PromptlineContext = ExtensionContext;
