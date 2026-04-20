/**
 * Resolves the HTTP port used by the local wterm demo.
 */
export function getWtermDemoPort(): number {
  const value = process.env.WTERM_DEMO_PORT;
  const port = Number(value ?? 4831);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid WTERM_DEMO_PORT: ${value}`);
  }

  return port;
}
