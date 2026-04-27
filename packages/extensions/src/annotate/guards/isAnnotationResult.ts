import type { AnnotationResult } from "../types.js";
import { isRecord } from "./isRecord.js";

/**
 * Validates the minimal shape needed for an annotation result payload.
 *
 * @param value Unknown message payload.
 * @returns True when the payload has the expected result shape.
 */
export function isAnnotationResult(value: unknown): value is AnnotationResult {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.success === "boolean";
}
