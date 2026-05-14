import { extractJsonArrayText } from "./extractJsonArrayText.js";
import type { RecreatedObservationTopic } from "./types/RecreatedObservationTopic.js";

/**
 * Parses LLM topic-recreation output into validated topics.
 *
 * @param output Raw model output.
 * @returns Valid recreated topics.
 */
export function parseRecreatedObservationTopics(output: string): RecreatedObservationTopic[] {
  const jsonText = extractJsonArrayText(output);
  if (!jsonText) return [];
  try {
    const parsed = JSON.parse(jsonText) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => parseTopic(item));
  } catch {
    return [];
  }
}

/**
 * Parses one candidate topic object.
 *
 * @param item Candidate topic.
 * @returns One topic or an empty array.
 */
function parseTopic(item: unknown): RecreatedObservationTopic[] {
  if (!item || typeof item !== "object") return [];
  const candidate = item as { title?: unknown; sourceMessageIndexes?: unknown };
  if (typeof candidate.title !== "string" || !Array.isArray(candidate.sourceMessageIndexes)) return [];
  const sourceMessageIndexes = candidate.sourceMessageIndexes.filter((index): index is number => Number.isInteger(index) && index > 0);
  if (candidate.title.trim().length === 0 || sourceMessageIndexes.length === 0) return [];
  return [{ title: candidate.title.trim(), sourceMessageIndexes }];
}
