import type { LocalImageReaderConfig } from "./types.js";

/**
 * Validate a settings.json sub-entry (from the local-image-reader key).
 * Returns null when required keys are missing or invalid, instead of throwing.
 *
 * @param entry - Raw settings entry.
 * @returns Validated config, or null if invalid.
 */
export function validateSettingsEntry(
  entry: unknown,
): LocalImageReaderConfig | null {
  if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
    return null;
  }
  const obj = entry as Record<string, unknown>;
  const url = obj.url;
  const apiKey = obj.apiKey;
  const model = typeof obj.model === "string" && obj.model.trim()
    ? obj.model.trim()
    : undefined;
  if (typeof url !== "string" || typeof apiKey !== "string") {
    return null; // Missing required keys — treat as absent
  }
  if (!url.trim() || !apiKey.trim()) {
    return null;
  }
  return {
    url: url.trim(),
    apiKey: apiKey.trim(),
    model,
    maxTokens:
      typeof obj.maxTokens === "number" && obj.maxTokens > 0
        ? obj.maxTokens
        : undefined,
  };
}
