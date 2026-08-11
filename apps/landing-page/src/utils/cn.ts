import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class values and resolves Tailwind utility conflicts.
 *
 * @param values Class values that may be conditionally enabled.
 * @returns A Tailwind-safe class string.
 */
export function cn(...values: ClassValue[]): string {
	return twMerge(clsx(values));
}
