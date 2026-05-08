/**
 * Renders the reusable Nexus showcase video card for feature examples.
 *
 * @param title Accessible title for the video card.
 * @returns Static HTML for the video card.
 */
export function renderShowcaseVideo(title: string): string {
  return `
    <aside class="feature-video-card" aria-label="${title} video">
      <div class="terminal-bar">
        <span class="terminal-dot dot-rose"></span>
        <span class="terminal-dot dot-amber"></span>
        <span class="terminal-dot dot-mint"></span>
        <span class="terminal-title">nexus / ${title}</span>
      </div>
      <video src="/nexus-showcase.mp4" autoplay muted loop playsinline controls></video>
    </aside>
  `;
}
