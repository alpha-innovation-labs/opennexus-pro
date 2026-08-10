/**
 * Minimal feature-flag types needed by mini-apps.
 * Mirrors @nexus/feature-flags/types.js to avoid a circular dependency.
 */

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
