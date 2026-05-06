import type { AnnotationResult } from "../types.js";

/**
 * Creates a cancelled annotation result with empty element data.
 *
 * @param reason Cancellation reason.
 * @returns Cancelled annotation result.
 */
export function createCancelledAnnotationResult(reason: string): AnnotationResult {
  return {
    success: false,
    cancelled: true,
    reason,
    elements: [],
    url: "",
    viewport: { width: 0, height: 0 },
  };
}
