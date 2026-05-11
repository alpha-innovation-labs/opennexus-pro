/**
 * Detects image MIME types that can be returned as attachments.
 *
 * @param mime MIME type without parameters.
 * @returns True when the MIME type is an image.
 */
export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}
