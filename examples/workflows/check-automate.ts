/**
 * check-automate — TypeScript workflow definition.
 *
 * Equivalent of examples/workflows/check-automate.yaml but as a TypeScript
 * object, built by hand since the factory API does not yet support
 * `foreach`, `do_until`, `if_else`, or agent steps inside control blocks.
 *
 * Usage: nexus factory run check-automate
 */

import type { WorkflowFile } from "./workflow-schema.js";

export const checkAutomate: WorkflowFile = {
  prompt: `Go over each durable package one by one. For each package, run a
		check with an agent that looks for errors. If there are no errors, move to
		the next package. If there are errors, spawn an agent that fixes them, then
		repeat up to three times until either the agent finally manages to fix all
		the errors of that package or they cannot — in which case involve the human.`,

  name: "check-automate",

  control: [
    // Phase 1: Discover all durable packages.
    {
      id: "discover",
      type: "loop_until",
      max_iterations: 3,
      steps: [
        {
          id: "list-packages",
          type: "bash",
          output: "packages",
          command:
            "npx turbo ls 2>&1 | grep -E '(@extensions|@nexus)/' | sed 's/^[[:space:]]*//' | cut -d' ' -f1",
        },
      ],
    },

    // Phase 2: For each package, retry check up to 3 times.
    {
      id: "run-checks",
      type: "foreach",
      max_iterations: 3,
      items: "<output:packages>",
      input_var: "pkg",
      steps: [
        {
          id: "do-check",
          type: "do_until",
          max_iterations: 3,
          condition: "<output:check-result>",
          steps: [
            {
              id: "check",
              type: "agent",
              output: "check-result",
              agent: "nexus",
              command:
                "Run 'just check {{pkg}}'. Return true if all tests pass.\nIf they do not pass, return the errors.",
            },

            // If check returns 'true', break the loop.
            // If check returns errors, run agent-fix, then retry.
            {
              id: "fix-failures",
              type: "if_else",
              condition: "<output:check-result> == 'true'",
              steps: [
                {
                  id: "noop-pass",
                  type: "bash",
                  command: 'echo "no-op"',
                },
              ],
              else_steps: [
                {
                  id: "run-agent-fix",
                  type: "agent",
                  agent: "nexus",
                  command:
                    "Please read ./docs/decision.md. Then, run 'just check {{pkg}}'and fix all errors. Do not run any other command. You need to\n\t\t\t\t\tjust make sure the index.ts is reflective of the current code.\n\t\t\t\t\tDo NOT add no longer existing files. If the command does not\n\t\t\t\t\tfail, simply skip. Don't worry about it.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
