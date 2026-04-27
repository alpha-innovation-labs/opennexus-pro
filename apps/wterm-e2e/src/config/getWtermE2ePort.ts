/**
 * Resolves the HTTP port used by the local wterm e2e.
 */
export function getWtermE2ePort(): number {
  const value = process.env.WTERM_E2E_PORT;
  const port = Number(value ?? 4831);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid WTERM_E2E_PORT: ${value}`);
  }

  return port;
}
