let transportPreference = "sse";

/**
 * Returns the active transport preference.
 *
 * @returns Transport preference.
 */
export function getTransportPreference(): string {
  return transportPreference;
}

/**
 * Stores the active transport preference.
 *
 * @param value Transport preference.
 */
export function setTransportPreference(value: string): void {
  transportPreference = value;
}
