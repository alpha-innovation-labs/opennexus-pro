import type { BagsItem } from "../data/bagsItems";

export type TickingItemPrice = {
  readonly value: string;
  readonly direction: "up" | "down";
};

/**
 * Calculates a deterministic pseudo-random ticking price for a table row.
 *
 * @param item Bags item with a base price.
 * @param index Row index used to diversify movement.
 * @param frame Local scene frame.
 * @returns Formatted price and movement direction.
 */
export function getTickingItemPrice(item: BagsItem, index: number, frame: number): TickingItemPrice {
  const wave = Math.sin(frame / (5 + (index % 4)) + index * 1.73);
  const chop = Math.cos(frame / (9 + (index % 5)) + index * 0.91);
  const previousWave = Math.sin((frame - 1) / (5 + (index % 4)) + index * 1.73);
  const previousChop = Math.cos((frame - 1) / (9 + (index % 5)) + index * 0.91);
  const value = item.basePrice * (1 + wave * 0.035 + chop * 0.018);
  const previousValue = item.basePrice * (1 + previousWave * 0.035 + previousChop * 0.018);

  return {
    value: `$${value.toFixed(5)}`,
    direction: value >= previousValue ? "up" : "down",
  };
}
