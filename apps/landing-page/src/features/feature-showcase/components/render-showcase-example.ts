import type { ShowcaseExample } from "../types/showcase-feature.js";
import { renderShowcaseVideo } from "./render-showcase-video.js";

/**
 * Renders one feature example with text on the left and video on the right.
 *
 * @param example Feature example content derived from bundled Nexus features.
 * @returns Static HTML for one feature example row.
 */
export function renderShowcaseExample(example: ShowcaseExample): string {
  const bullets = example.bullets.map((bullet) => `<li>${bullet}</li>`).join("");

  return `
    <article class="showcase-example" id="${example.id}" data-showcase-child="${example.id}">
      <div class="feature-copy-card">
        <p class="eyebrow">${example.eyebrow}</p>
        <h3>${example.title}</h3>
        <p>${example.body}</p>
        <ul>${bullets}</ul>
      </div>
      ${renderShowcaseVideo(example.title)}
    </article>
  `;
}
