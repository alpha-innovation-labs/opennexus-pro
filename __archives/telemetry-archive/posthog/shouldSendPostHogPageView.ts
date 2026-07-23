/**
 * Checks whether a telemetry event should also appear in PostHog Web Analytics.
 *
 * @param eventName Telemetry event name.
 * @returns True when the event maps to a synthetic page view.
 */
export function shouldSendPostHogPageView(eventName: string): boolean {
  return eventName === "command.used";
}
