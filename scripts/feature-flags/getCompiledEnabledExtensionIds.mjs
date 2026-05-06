/**
 * Lists extension ids enabled in the production-safe compiled feature-flag config.
 *
 * @param {Record<string, any>} config Production-safe feature-flag config.
 * @param {Set<string>} [registerableIds] Feature ids with registration modules.
 * @returns {string[]} Compiled enabled extension ids.
 */
export function getCompiledEnabledExtensionIds(config, registerableIds = new Set(Object.keys(config.extensions))) {
  return [
    ...Object.entries(config.extensions),
    ...Object.entries(config.other ?? {}).filter(([id]) => registerableIds.has(id)),
  ]
    .filter(([, value]) => value.enabled && !value.devOnly)
    .map(([id]) => id);
}
