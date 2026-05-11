/**
 * Checks whether a URL uses an HTTP transport accepted by web fetch.
 *
 * @param url URL string to validate.
 * @returns True when the URL starts with http:// or https://.
 */
export function isHttpUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}
