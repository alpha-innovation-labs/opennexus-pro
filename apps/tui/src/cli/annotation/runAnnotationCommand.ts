import { formatAnnotationsDaemonStatus } from "@nexus/annotations-daemon-core/commands/formatAnnotationsDaemonStatus.js";
import { getAnnotationsDaemonStatus } from "@nexus/annotations-daemon-core/commands/getAnnotationsDaemonStatus.js";
import { restartAnnotationsDaemon } from "@nexus/annotations-daemon-core/commands/restartAnnotationsDaemon.js";
import { startAnnotationsDaemon } from "@nexus/annotations-daemon-core/commands/startAnnotationsDaemon.js";
import { stopAnnotationsDaemon } from "@nexus/annotations-daemon-core/commands/stopAnnotationsDaemon.js";
import { hasHelpFlag } from "../help/hasHelpFlag.js";
import { formatAnnotationRestartMessage } from "./formatAnnotationRestartMessage.js";
import { formatAnnotationStartMessage } from "./formatAnnotationStartMessage.js";
import { formatAnnotationStopMessage } from "./formatAnnotationStopMessage.js";
import { printAnnotationLogs } from "./printAnnotationLogs.js";
import { printAnnotationUsage } from "./printAnnotationUsage.js";

/**
 * Executes a user-facing annotation daemon command.
 *
 * @param argv Raw annotation CLI args.
 * @returns Exit code for the command.
 */
export async function runAnnotationCommand(argv: readonly string[]): Promise<number> {
  const command = argv[1];
  if (hasHelpFlag(argv)) {
    printAnnotationUsage();
    return 0;
  }

  switch (command) {
    case "start": {
      const result = await startAnnotationsDaemon();
      console.log(formatAnnotationStartMessage(result.started));
      console.log(formatAnnotationsDaemonStatus(result.status));
      return 0;
    }
    case "stop": {
      const result = await stopAnnotationsDaemon();
      console.log(formatAnnotationStopMessage(result.stopped));
      console.log(formatAnnotationsDaemonStatus(result.status));
      return 0;
    }
    case "restart": {
      const result = await restartAnnotationsDaemon();
      console.log(formatAnnotationRestartMessage(result.restarted));
      console.log(formatAnnotationsDaemonStatus(result.status));
      return 0;
    }
    case "status": {
      console.log(formatAnnotationsDaemonStatus(await getAnnotationsDaemonStatus()));
      return 0;
    }
    case "logs": {
      await printAnnotationLogs();
      return 0;
    }
    default:
      printAnnotationUsage();
      return 1;
  }
}
