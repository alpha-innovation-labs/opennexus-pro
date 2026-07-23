import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export type FeatureProductCategory = "core" | "dev" | "pro" | "mini-app" | "extension";

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

/**
 * User-supplied feature-flag overrides from config.json.
 * Users write a plain boolean: `false` to disable, omit or `true` to enable.
 */
export type UserFeatureFlagOverride = boolean;
