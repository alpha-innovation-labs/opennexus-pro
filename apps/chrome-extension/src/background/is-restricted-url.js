/**
 * Reports whether Chrome blocks content-script annotation for a URL.
 *
 * @param {string|undefined} url Browser tab URL.
 * @returns {boolean} True when the URL is restricted.
 */
export function isRestrictedUrl(url) {
  if (!url) return true;
  return /^(chrome|chrome-extension|edge|about|devtools|view-source):/.test(url);
}
