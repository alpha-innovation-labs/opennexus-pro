import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { PromptlineConfig } from "./config/types";

export type PromptlineDeps = {
  exec: ExtensionAPI["exec"];
  getThinkingLevel: ExtensionAPI["getThinkingLevel"];
  setThinkingLevel: ExtensionAPI["setThinkingLevel"];
  getSessionName: ExtensionAPI["getSessionName"];
  getCommands: ExtensionAPI["getCommands"];
  getAllTools: ExtensionAPI["getAllTools"];
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
