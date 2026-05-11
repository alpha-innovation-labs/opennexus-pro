import type { DevModalVariation } from "./types.js";

/**
 * Creates sample modal variations used by the dev modal playground.
 *
 * @returns Modal variations with deterministic sample data.
 */
export function createDevModalVariations(): DevModalVariation[] {
  return [
    {
      id: "main",
      label: "Main",
      rows: ["Status: ready", "Latency: 42ms", "Items: 17", "Seed: alpha-7"],
    },
    {
      id: "spec",
      label: "Spec",
      rows: ["Variant: compact", "Rows: 4", "Columns: 3", "Seed: beta-3"],
    },
    {
      id: "dense",
      label: "Dense",
      rows: ["A1  B2  C3", "D4  E5  F6", "G7  H8  I9", "Seed: gamma-1"],
    },
  ];
}
