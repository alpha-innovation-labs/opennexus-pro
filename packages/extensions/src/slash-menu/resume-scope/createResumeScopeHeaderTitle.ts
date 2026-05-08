import type { ResumeScope } from "./ResumeScope.js";

/**
 * Creates the resume menu source switcher title.
 *
 * @param scope Active resume source.
 * @returns Header title with selected and unselected source tabs.
 */
export function createResumeScopeHeaderTitle(scope: ResumeScope): string {
  const current = scope === "current" ? "◉ Current Folder" : "○ Current Folder";
  const all = scope === "all" ? "◉ All" : "○ All";
  return `${current} │ ${all}`;
}
