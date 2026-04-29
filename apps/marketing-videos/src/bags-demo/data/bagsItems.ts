export type BagsItem = {
  readonly symbol: string;
  readonly name: string;
  readonly basePrice: number;
};

/**
 * Provides static demo Bags rows matching the submitted reference list.
 *
 * @returns Curated token rows shown in the TUI video.
 */
export function getBagsItems(): readonly BagsItem[] {
  return [
    { symbol: "$PEPE", name: "Pepe By Matt Furie", basePrice: 0.00327 },
    { symbol: "$NYAN", name: "Nyan Cat", basePrice: 0.02508 },
    { symbol: "$BTH", name: "BUY THE HAT", basePrice: 0.02316 },
    { symbol: "$GAS", name: "Gas Town", basePrice: 0.0215 },
    { symbol: "$RALPH", name: "Ralph Wiggum", basePrice: 0.02028 },
    { symbol: "$ASTERO", name: "The space shiba inu", basePrice: 0.01982 },
    { symbol: "$MRBEAST", name: "MrBeast FUND", basePrice: 0.01533 },
    { symbol: "$WATER", name: "TeamWater", basePrice: 0.01257 },
    { symbol: "$LORIA", name: "Upward Spiral", basePrice: 0.0121 },
    { symbol: "$NXS", name: "Nexus", basePrice: 0.05214 },
    { symbol: "$ZHC", name: "ZERO-HUMAN COMPANY", basePrice: 0.01054 },
    { symbol: "$XIXHLOL", name: "xIxhlol", basePrice: 0.01031 },
    { symbol: "$NPM", name: "npm run dev", basePrice: 0.00925 },
    { symbol: "$EVA", name: "Eva Everywhere", basePrice: 0.00881 },
    { symbol: "$CMEM", name: "Claude Memory", basePrice: 0.00866 },
    { symbol: "$TERRA", name: "SE Terraformation", basePrice: 0.0082 },
    { symbol: "$COMET", name: "Comet Portfolio", basePrice: 0.00729 },
    { symbol: "$WO", name: "Nikiva Boar", basePrice: 0.00694 },
    { symbol: "$BOSS", name: "Ibiza Final Boss", basePrice: 0.00678 },
    { symbol: "$TOWN", name: "Moltbook Town", basePrice: 0.00675 },
  ];
}
