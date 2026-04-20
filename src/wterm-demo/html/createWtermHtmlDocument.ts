/**
 * Creates the HTML shell used by the browser wterm demo.
 */
export function createWtermHtmlDocument(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nexus wterm demo</title>
    <link rel="stylesheet" href="/client.css" />
    <style>
      html, body { height: 100%; margin: 0; background: #0b1020; }
      body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
      #terminal { height: 100%; }
    </style>
  </head>
  <body>
    <div
      id="terminal"
      role="textbox"
      aria-label="Nexus terminal"
      aria-multiline="true"
      tabindex="0"
    ></div>
    <script type="module" src="/client.js"></script>
  </body>
</html>`;
}
