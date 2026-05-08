/**
 * Renders a Vercel-inspired Develop, Preview, Ship workflow strip.
 *
 * @returns Static HTML for the workflow strip.
 */
export function renderWorkflowStrip(): string {
  return `
    <div class="workflow-strip" aria-label="Develop Preview Ship workflow">
      <article class="workflow-step workflow-develop">
        <span>Develop</span>
        <strong>Code with context</strong>
        <p>Repo-aware tools keep search, language intelligence, and file work close to the agent loop.</p>
      </article>
      <article class="workflow-step workflow-preview">
        <span>Preview</span>
        <strong>Review every move</strong>
        <p>Compact UI, usage signals, and mini-apps make progress inspectable before work ships.</p>
      </article>
      <article class="workflow-step workflow-ship">
        <span>Ship</span>
        <strong>Finish with less waste</strong>
        <p>Savings surfaces and focused defaults cut terminal noise while preserving detail on demand.</p>
      </article>
    </div>
  `;
}
