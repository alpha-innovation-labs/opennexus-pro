/**
 * Renders the terminal-inspired product demo frame for the Nexus showcase video.
 *
 * @returns Static HTML for the terminal demo panel.
 */
export function renderTerminalDemo(): string {
  return `
    <aside class="terminal-demo" id="demo" aria-label="Nexus terminal demo">
      <div class="terminal-bar">
        <span class="terminal-dot dot-rose"></span>
        <span class="terminal-dot dot-amber"></span>
        <span class="terminal-dot dot-mint"></span>
        <span class="terminal-title">nexus / agentic-workflow</span>
      </div>
      <video src="/nexus-showcase.mp4" autoplay muted loop playsinline controls></video>
    </aside>
  `;
}
