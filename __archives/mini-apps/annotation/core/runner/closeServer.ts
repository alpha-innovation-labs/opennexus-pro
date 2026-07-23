import type { Server } from "node:http";

/**
 * Closes an HTTP server and waits for completion.
 *
 * @param server HTTP server to close.
 */
export async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
