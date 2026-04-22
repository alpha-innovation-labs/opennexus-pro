import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { PromptlineConfig } from "./config/types.js";

export type PromptlineDeps = {
  exec: ExtensionAPI["exec"];
  getThinkingLevel: ExtensionAPI["getThinkingLevel"];
  setThinkingLevel: ExtensionAPI["setThinkingLevel"];
  getSessionName: ExtensionAPI["getSessionName"];
  getPromptlineConfig: () => PromptlineConfig;
  refreshPromptlineConfig: (cwd: string) => Promise<PromptlineConfig>;
};

export type PromptlineRefreshDeps = {
  exec: ExtensionAPI["exec"];
  getThinkingLevel?: ExtensionAPI["getThinkingLevel"];
  setThinkingLevel?: ExtensionAPI["setThinkingLevel"];
  getSessionName?: ExtensionAPI["getSessionName"];
};

export type PromptlineContext = ExtensionContext;
