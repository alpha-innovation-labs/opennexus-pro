export interface JsonLineParser {
  push(chunk: string): void;
}

/**
 * Creates a strict JSONL parser for RPC stdout.
 *
 * @param onValue Callback for each parsed JSON object.
 * @returns Incremental JSON line parser.
 */
export function createJsonLineParser(onValue: (value: unknown) => void): JsonLineParser {
  let buffer = "";

  return {
    push(chunk: string): void {
      buffer += chunk;

      for (;;) {
        const newlineIndex = buffer.indexOf("\n");
        if (newlineIndex < 0) {
          return;
        }

        const line = buffer.slice(0, newlineIndex).replace(/\r$/, "").trim();
        buffer = buffer.slice(newlineIndex + 1);
        if (!line) {
          continue;
        }

        onValue(JSON.parse(line) as unknown);
      }
    },
  };
}
