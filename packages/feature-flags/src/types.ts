import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export type FeatureProductCategory = "extension" | "mini-app";

export type FeatureFlagConfig = {
  category?: FeatureProductCategory;
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
