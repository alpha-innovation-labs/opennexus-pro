export type AnnotationMutationRoute = {
  annotationId: string;
  action: "claim" | "resolve";
};

/**
 * Parses annotation mutation routes.
 *
 * @param pathname Request pathname.
 * @returns Parsed mutation route, or null when not matched.
 */
export function routeAnnotationMutation(pathname: string): AnnotationMutationRoute | null {
  const match = pathname.match(/^\/annotations\/([^/]+)\/(claim|resolve)$/);
  if (!match) return null;
  return { annotationId: decodeURIComponent(match[1]), action: match[2] as "claim" | "resolve" };
}
