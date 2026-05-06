import type { StoredAnnotation } from "../store/types.js";

/**
 * Builds the prompt sent to the real Nexus chat for annotation feedback.
 *
 * @param annotation Stored annotation submitted by the browser extension.
 * @param workspaceDir Project directory the agent must edit.
 * @returns Prompt for the real Nexus agent.
 */
export function buildAnnotationAgentPrompt(annotation: StoredAnnotation, workspaceDir: string): string {
  const result = annotation.result;
  const elements = result.elements?.map((element, index) => ({
    index: index + 1,
    selector: element.selector,
    location: element.location,
    tag: element.tag,
    id: element.id,
    classes: element.classes,
    text: element.text,
    comment: element.comment,
  })) ?? [];

  return [
    "You are handling visual feedback submitted from the Nexus browser annotation extension.",
    `Project directory: ${workspaceDir}`,
    `Annotated URL: ${result.url ?? "unknown"}`,
    `Annotation id: ${annotation.id}`,
    `Annotation owner: annotation-agent-${annotation.id}`,
    "Use the available code tools to inspect and edit this local project. Do not fabricate changes.",
    "First call claim_annotation with the annotation id and owner above.",
    "Apply the requested feedback to source files so the local dev server live reloads.",
    "Only after the requested change is actually complete, call resolve_annotation with the same annotation id and owner.",
    "If no change is needed, explain why, then call resolve_annotation only when the feedback is genuinely satisfied.",
    "Finish with a concise summary naming the files changed and what was updated.",
    "Annotation payload:",
    JSON.stringify({ annotationId: annotation.id, prompt: result.prompt, elements }, null, 2),
  ].join("\n\n");
}
