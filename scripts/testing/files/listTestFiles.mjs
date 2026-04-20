import { relative, resolve } from "node:path";
import { collectTestFiles } from "./collectTestFiles.mjs";
import { isReleaseExecutableTestFile } from "./isReleaseExecutableTestFile.mjs";
import { isTestFile } from "./isTestFile.mjs";

/**
 * Lists project-relative test files for the requested mode.
 *
 * @param {string} projectRoot Root directory of the project.
 * @param {"without-release" | "with-release"} mode Requested test mode.
 * @returns {Promise<string[]>} Sorted project-relative test file paths.
 */
export async function listTestFiles(projectRoot, mode) {
  const testDirectoryPath = resolve(projectRoot, "test");
  const collectedFiles = await collectTestFiles(testDirectoryPath);
  const projectRelativeFiles = collectedFiles
    .map((filePath) => relative(projectRoot, filePath).split("\\").join("/"))
    .filter(isTestFile);

  if (mode === "with-release") {
    return projectRelativeFiles;
  }

  return projectRelativeFiles.filter((filePath) => !isReleaseExecutableTestFile(filePath));
}
