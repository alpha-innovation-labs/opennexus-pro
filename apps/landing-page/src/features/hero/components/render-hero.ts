import { renderTerminalDemo } from "./render-terminal-demo.js";

/**
 * Renders the landing hero with a left-side value proposition and right-side terminal demo.
 *
 * @returns Static HTML for the hero section.
 */
export function renderHero(): string {
  return `
    <section class="hero-section" id="top">
      <div class="hero-copy">
        <h1>Love your TUI again</h1>
        <p class="hero-body">
          Nexus turns terminal coding into a disciplined agent workflow: compact answers,
          bundled extensions, visible usage, and a calmer interface for serious builders.
        </p>
        <div class="hero-actions">
          <a class="primary-button" href="#demo">Watch demo</a>
          <a class="secondary-button" href="#features">Explore features</a>
        </div>
      </div>
      ${renderTerminalDemo()}
    </section>
  `;
}
