import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export type FeatureFlagConfig = {
  devOnly?: boolean;
  enabled: boolean;
  features: string[];
};

export type ExtensionFeatureFlagConfig = FeatureFlagConfig;

export type FeatureFlagsConfig = {
  extensions: Record<string, ExtensionFeatureFlagConfig>;
  other?: Record<string, FeatureFlagConfig>;
};

export type ExtensionFeatureFlag = {
  id: string;
  enabled: boolean;
  features: string[];
  register: (pi: ExtensionAPI) => void | Promise<void>;
};
