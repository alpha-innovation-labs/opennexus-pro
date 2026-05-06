import { fetchPendingAnnotations } from "@nexus/mini-apps/annotation/core/client/fetchPendingAnnotations.js";
import { Type } from "@sinclair/typebox";
import { formatStoredAnnotationSummary } from "./formatStoredAnnotationSummary.js";

/**
 * Creates the tool that reads pending browser annotations.
 *
 * @returns Pi tool definition.
 */
export function createReadPendingAnnotationsTool() {
  return {
    name: "read_pending_annotations",
    label: "Read Pending Annotations",
    description: "Read pending visual feedback captured by the local Nexus annotations daemon.",
    parameters: Type.Object({}),
    async execute() {
      const annotations = await fetchPendingAnnotations();
      const text = annotations.length === 0
        ? "No pending annotations."
        : [`Pending annotations (${annotations.length}):`, ...annotations.map(formatStoredAnnotationSummary)].join("\n");
      return { content: [{ type: "text" as const, text }], details: { annotations } };
    },
  };
}
