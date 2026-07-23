/**
 * Reports whether annotation submissions should start the real Nexus agent.
 *
 * @returns True unless explicitly disabled for isolated tests.
 */
export function shouldRunAnnotationAgent(): boolean {
  return process.env.NEXUS_ANNOTATION_DISABLE_AGENT !== "1";
}
