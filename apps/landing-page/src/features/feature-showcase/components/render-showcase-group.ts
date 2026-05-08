import type { ShowcaseGroup } from "../types/showcase-feature.js";
import { renderShowcaseExample } from "./render-showcase-example.js";

/**
 * Renders one major showcase group and all of its examples.
 *
 * @param group Major feature group content.
 * @returns Static HTML for one major showcase group.
 */
export function renderShowcaseGroup(group: ShowcaseGroup): string {
  return `
    <section class="showcase-group" id="${group.id}" data-showcase-major="${group.id}">
      <div class="showcase-group-heading">
        <p class="eyebrow">${group.eyebrow}</p>
        <h2>${group.title}</h2>
        <p>${group.body}</p>
      </div>
      <div class="showcase-examples">
        ${group.examples.map(renderShowcaseExample).join("")}
      </div>
    </section>
  `;
}
