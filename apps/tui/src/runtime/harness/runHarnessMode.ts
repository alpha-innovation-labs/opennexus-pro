import type { ExtensionFactory } from "@mariozechner/pi-coding-agent";

export interface RunHarnessModeOptions {
  argv: string[];
  extensionFactories: ExtensionFactory[];
}

interface HarnessModule {
  createTestSession: (options: {
    extensionFactories: ExtensionFactory[];
    cwd: string;
    mockTools: Record<string, string>;
  }) => Promise<{
    run: (...turns: unknown[]) => Promise<void>;
    dispose: () => void;
    events: { all: unknown[] };
  }>;
  when: (prompt: string, actions: unknown[]) => unknown;
  calls: (toolName: string, params: Record<string, unknown>) => unknown;
  says: (text: string) => unknown;
}

/**
 * Runs the experimental dev-only Pi test-harness mode.
 *
 * @param options Harness startup inputs.
 * @returns A promise that resolves when the scripted session finishes.
 */
export async function runHarnessMode(options: RunHarnessModeOptions): Promise<void> {
  const harness = await importHarnessModule();
  const session = await harness.createTestSession({
    extensionFactories: options.extensionFactories,
    cwd: process.cwd(),
    mockTools: {
      bash: "$ echo nexus-dev-test\nnexus-dev-test",
      read: "mocked read result",
      write: "mocked write result",
      edit: "mocked edit result",
    },
  });

  try {
    console.log("[nexus dev-test] Running Pi test harness smoke session.");
    if (options.argv.length > 0) {
      console.log(`[nexus dev-test] Ignoring app argv in harness mode: ${options.argv.join(" ")}`);
    }

    await session.run(
      harness.when("List files in the project", [
        harness.calls("bash", { command: "ls" }),
        harness.says("Harness mode completed."),
      ]),
    );

    console.log(`[nexus dev-test] Recorded ${session.events.all.length} event(s).`);
    console.log("[nexus dev-test] This mode exercises the Pi harness, not the interactive Nexus TUI.");
  } finally {
    session.dispose();
  }
}

/**
 * Imports the optional Pi test harness package.
 *
 * @returns The imported harness module.
 */
async function importHarnessModule(): Promise<HarnessModule> {
  try {
    return (await import("@marcfargas/pi-test-harness")) as HarnessModule;
  } catch (error) {
    throw new Error(
      "Nexus dev-test mode requires @marcfargas/pi-test-harness. Run `npm install` before using `npm run dev-test`.",
      { cause: error },
    );
  }
}
