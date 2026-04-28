/**
 * Lists extension ids enabled in the production-safe compiled feature-flag config.
 *
 * @param {Record<string, any>} config Production-safe feature-flag config.
 * @returns {string[]} Compiled enabled extension ids.
 */
export function getCompiledEnabledExtensionIds(config) {
  return Object.entries(config.extensions)
    .filter(([id, value]) => value.enabled && id !== "dev")
    .map(([id]) => id);
}
