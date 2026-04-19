import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export type ExtensionFeatureFlagConfig = {
  enabled: boolean;
  features: string[];
};

export type FeatureFlagsConfig = {
  extensions: Record<string, ExtensionFeatureFlagConfig>;
};

export type ExtensionFeatureFlag = {
  id: string;
  enabled: boolean;
  features: string[];
  register: (pi: ExtensionAPI) => void;
};
