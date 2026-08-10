/**
 * Formats a date as a compact numeric local date.
 *
 * @param date Date to format in the user's local timezone.
 * @returns Date label such as "4/13/2026".
 */
export function formatDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}
