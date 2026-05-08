/**
 * Renders the final core-plugin savings section.
 *
 * @returns Static HTML for token and attention savings content.
 */
export function renderSavingsSection(): string {
  return `
    <section class="savings-section" id="core-plugin-savings" data-showcase-child="core-plugin-savings">
      <div class="feature-copy-card savings-card">
        <p class="eyebrow">Core plugins</p>
        <h2>Core plugins make savings visible.</h2>
        <p>
          RTK includes a /savings command, slashusage stores five-minute usage snapshots,
          and Tron compresses tool calls, thinking, and user messages into compact surfaces.
        </p>
        <ul>
          <li>Token-saving defaults keep answers compact.</li>
          <li>Usage graphs show pressure before context waste grows.</li>
          <li>Compact tool lines preserve details behind readable summaries.</li>
        </ul>
      </div>
    </section>
  `;
}
