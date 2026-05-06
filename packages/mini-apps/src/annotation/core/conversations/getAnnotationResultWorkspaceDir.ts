import type { AnnotationResult } from "@nexus/mini-apps/annotate/types.js";

/**
 * Extracts the workspace directory selected for the real Nexus agent.
 *
 * @param result Annotation result posted by the browser extension.
 * @returns Workspace directory string, or an empty value when missing.
 */
export function getAnnotationResultWorkspaceDir(result: AnnotationResult): string {
  const workspaceDir = (result as AnnotationResult & { workspaceDir?: unknown }).workspaceDir;
  return typeof workspaceDir === "string" ? workspaceDir.trim() : "";
}
