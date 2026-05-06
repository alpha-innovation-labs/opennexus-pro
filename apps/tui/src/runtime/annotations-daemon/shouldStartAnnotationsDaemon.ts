/**
 * Returns whether startup should launch the annotations daemon.
 *
 * @param argv Normalized Nexus CLI arguments.
 * @param featureEnabled Whether annotation startup features are enabled.
 * @returns True when annotation startup is enabled for an interactive run.
 */
export function shouldStartAnnotationsDaemon(argv: readonly string[], featureEnabled: boolean): boolean {
  return featureEnabled && !argv.includes("--no-extensions") && !argv.includes("-ne") && !argv.includes("--print");
}
