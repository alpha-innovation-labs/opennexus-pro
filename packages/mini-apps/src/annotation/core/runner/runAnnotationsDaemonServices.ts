import { createAnnotationsDaemonServer } from "../server/createAnnotationsDaemonServer.js";
import { closeServer } from "./closeServer.js";
import { ANNOTATIONS_DAEMON_HOST, ANNOTATIONS_DAEMON_PORT } from "../shared/constants.js";

/**
 * Runs the annotations daemon HTTP service until shutdown.
 *
 * @param isStopping Reports whether shutdown has started.
 * @returns Promise that resolves when the service exits.
 */
export async function runAnnotationsDaemonServices(isStopping: () => boolean): Promise<void> {
  const server = createAnnotationsDaemonServer();
  server.listen(ANNOTATIONS_DAEMON_PORT, ANNOTATIONS_DAEMON_HOST);

  while (!isStopping()) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  await closeServer(server);
}
