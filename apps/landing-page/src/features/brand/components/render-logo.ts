/**
 * Renders the animated Nexus brand mark and wordmark used in the fixed navigation.
 *
 * @returns Static HTML for the brand lockup.
 */
export function renderLogo(): string {
  return `
    <a class="brand-lockup" href="#top" aria-label="Nexus home">
      <span class="brand-mark" aria-hidden="true">
        <img src="/icon.svg" alt="" />
      </span>
      <span class="brand-name">Nexus</span>
    </a>
  `;
}
