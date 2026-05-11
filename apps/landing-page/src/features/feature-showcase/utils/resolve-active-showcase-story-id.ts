export type ShowcaseStorySectionMarker = {
  readonly id: string;
  readonly line: number;
  readonly isVisible: boolean;
};

/**
 * Picks the section whose title has crossed the sticky terminal activation line.
 *
 * @param markers Section markers in document order.
 * @param activationLine Viewport y-coordinate used for activation.
 * @param fallbackId Fallback id when no marker is active.
 * @returns The active showcase example id.
 */
export function resolveActiveShowcaseStoryId(markers: readonly ShowcaseStorySectionMarker[], activationLine: number, fallbackId: string): string {
  let activeId = fallbackId;
  let firstVisibleId = "";

  for (const marker of markers) {
    if (marker.isVisible && !firstVisibleId) firstVisibleId = marker.id;
    if (marker.line <= activationLine) activeId = marker.id;
  }

  return activeId || firstVisibleId || fallbackId;
}
