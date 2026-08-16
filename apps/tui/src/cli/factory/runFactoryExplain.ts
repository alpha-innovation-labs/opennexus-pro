/**
 * Explains how to create a factory (workflow).
 *
 * @returns Process exit code.
 */
export async function runFactoryExplain(): Promise<number> {
	console.log(`
factory explain — How to create a factory

A factory defines a workflow — a sequence of automated and AI-driven steps,
orchestrated through control blocks that govern execution order, iteration,
and validation.

Workflow files are YAML files placed in either:

  .factory/<name>.yaml   — project-local factory (per-project)
  examples/<name>.yaml   — shared template (from repo)

Workflow structure:

  name: <identifier>

  # Optional control blocks (executed in order)
  control:
    - type: loop_until | parallel
      max_iterations: <number>
      steps:
        - id: <step-id>
          type: bash | agent
          command: "<shell command or agent prompt>"
          validation_prompt: "<what passes the step>"  # bash only

  # Final steps (always sequential, after all control blocks)
  steps:
    - id: <step-id>
      type: bash | agent
      command: "<shell command or agent prompt>"

Step types:

  bash  — Runs a command, captures output. If validation fails, the loop
          retries (loop_until) or the next step sees the failure.
  agent — Spawns a persistent AI agent (Nexus) to inspect, reason, and
          fix issues from <previous-output>.

Output passing:

  Steps reference the immediately preceding step's output via
  <previous-output> templates, resolved by step id. No global state —
  each step only sees its predecessor.

Control block types:

  loop_until  — Sequential, retry until validation passes.
  parallel    — Concurrent execution, fail fast.

Example (dev.yaml):

  name: dev
  control:
    - id: dev
      type: bash
      command: "just dev"
      validation_prompt: "dev should display a help menu"
    - id: fix
      type: agent
      command: 'nexus "just dev failed because: <previous-output>"'
  steps:
    - id: fmt
      type: bash
      command: "just fmt"
  steps:
    - id: notify
      type: bash
      command: "notify 'dev workflow complete'"

To create your own factory:

  1. Create .factory/ in your project root (done automatically).
  2. Create a YAML file: .factory/my-workflow.yaml
  3. Define name, control blocks, and steps.
  4. List available factories: nexus factory list
`);
	return 0;
}
