import { extname } from "node:path";

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mp4", "video/mp4"],
  [".svg", "image/svg+xml; charset=utf-8"]
]);

/**
 * Resolves the HTTP content type for a static asset path.
 *
 * @param filePath Absolute static asset path.
 * @returns HTTP content type header value.
 */
export function getContentType(filePath: string): string {
  return contentTypes.get(extname(filePath)) ?? "application/octet-stream";
}
