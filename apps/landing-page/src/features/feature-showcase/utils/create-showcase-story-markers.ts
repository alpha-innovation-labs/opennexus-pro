import type { ShowcaseStorySectionMarker } from "./resolve-active-showcase-story-id";

/**
 * Reads section geometry into lightweight markers for active-story selection.
 *
 * @param sections Rendered showcase example sections.
 * @returns Section markers in document order.
 */
export function createShowcaseStoryMarkers(sections: readonly HTMLElement[]): readonly ShowcaseStorySectionMarker[] {
  return sections.map((section) => {
    const title = section.querySelector<HTMLElement>("[data-showcase-story-title]") ?? section;
    const sectionRect = section.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();

    return {
      id: section.dataset.showcaseChild ?? section.id,
      line: titleRect.top + titleRect.height * 0.5,
      isVisible: sectionRect.bottom > 0 && sectionRect.top < window.innerHeight,
    };
  });
}
