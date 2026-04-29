/**
 * Formats a dollar amount for the savings modal.
 *
 * @param value Dollar amount.
 * @returns Formatted currency string.
 */
export function formatDollar(value: number): string {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}
