import { getObservationsDir } from "@nexus/extensions-pro/observations/shared/getObservationsDir.js";
import { createObservationsUsageText } from "./createObservationsUsageText.js";
import { createObservationListJsonRows } from "./createObservationListJsonRows.js";
import { deleteObservationArtifacts } from "./deleteObservationArtifacts.js";
import { formatObservationListJson } from "./formatObservationListJson.js";
import { formatObservationListTable } from "./formatObservationListTable.js";
import { listObservationArtifactGroups } from "./listObservationArtifactGroups.js";
import { listObservationRecreateSessions } from "./listObservationRecreateSessions.js";
import { parseObservationsCommand } from "./parseObservationsCommand.js";
import { readObservationViewContent } from "./readObservationViewContent.js";
import { recreateObservationArtifactsForSession } from "./recreateObservationArtifactsForSession.js";
import { selectObservationArtifactGroups } from "./selectObservationArtifactGroups.js";
import { selectObservationRecreateSessions } from "./selectObservationRecreateSessions.js";

/**
 * Runs the Nexus observations CLI command namespace.
 *
 * @param argv Raw CLI arguments starting with `observations`.
 * @param cwd Current working directory for session lookup.
 * @param sessionDir Optional custom session directory.
 * @returns Process exit code.
 */
export async function runObservationsCommand(argv: readonly string[], cwd: string, sessionDir?: string): Promise<number> {
  const parsed = parseObservationsCommand(argv);
  if ("error" in parsed) {
    console.error(`${parsed.error}\n${createObservationsUsageText()}`);
    return 1;
  }

  const { request } = parsed;
  if (request.action === "get-location") {
    console.log(getObservationsDir());
    return 0;
  }
  if (request.action === "list") return runList(request.target!, request.json);
  if (request.action === "delete") return runDelete(request.target!);
  if (request.action === "view") return runView(request.target!);
  return runRecreate(request.target!, cwd, sessionDir);
}

/**
 * Runs the observations list action.
 *
 * @param target List target.
 * @param json Whether to print JSON.
 * @returns Process exit code.
 */
async function runList(target: string, json: boolean): Promise<number> {
  const groups = selectObservationArtifactGroups(await listObservationArtifactGroups(getObservationsDir()), target);
  const rows = await createObservationListJsonRows(groups);
  console.log(json ? formatObservationListJson(rows) : formatObservationListTable(rows));
  return 0;
}

/**
 * Runs the observations delete action.
 *
 * @param target Delete target.
 * @returns Process exit code.
 */
async function runDelete(target: string): Promise<number> {
  const deletedCount = await deleteObservationArtifacts(target);
  if (deletedCount === 0 && target !== "all") {
    console.error(`No observations found matching '${target}'`);
    return 1;
  }
  console.log(`Deleted ${deletedCount} observation group${deletedCount === 1 ? "" : "s"}`);
  return 0;
}

/**
 * Runs the observations view action.
 *
 * @param target View target.
 * @returns Process exit code.
 */
async function runView(target: string): Promise<number> {
  const result = await readObservationViewContent(target);
  if ("error" in result) {
    console.error(result.error);
    return 1;
  }
  process.stdout.write(result.content);
  return 0;
}

/**
 * Runs the observations recreate action.
 *
 * @param target Recreate target.
 * @param cwd Current working directory.
 * @param sessionDir Optional custom session directory.
 * @returns Process exit code.
 */
async function runRecreate(target: string, cwd: string, sessionDir?: string): Promise<number> {
  const selected = selectObservationRecreateSessions(await listObservationRecreateSessions(cwd, sessionDir), target);
  if ("error" in selected) {
    console.error(selected.error);
    return 1;
  }
  await Promise.all(selected.sessions.map((session) => recreateObservationArtifactsForSession(session)));
  console.log(`Recreated ${selected.sessions.length} observation group${selected.sessions.length === 1 ? "" : "s"}`);
  return 0;
}
