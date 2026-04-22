import type { FffFeatureKey } from "../shared/types.js";

export type FffFeatureDefinition = {
  id: FffFeatureKey;
  label: string;
  description: string;
};

export const FFF_FEATURE_DEFINITIONS: FffFeatureDefinition[] = [
  {
    id: "editorAutocomplete",
    label: "Editor @ autocomplete",
    description: "Use FFF for fuzzy @ file suggestions in the editor.",
  },
  {
    id: "readOverride",
    label: "Read override",
    description: "Resolve approximate file paths before built-in read runs.",
  },
  {
    id: "grepOverride",
    label: "Grep override",
    description: "Use FFF-backed indexed grep when compatible.",
  },
];
