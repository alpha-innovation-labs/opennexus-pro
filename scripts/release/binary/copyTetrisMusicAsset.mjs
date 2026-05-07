import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { copyPath } from "./copyPath.mjs";
import { isCompiledFeatureEnabled } from "./isCompiledFeatureEnabled.mjs";

const TETRIS_MUSIC_SOURCE = resolve("packages", "mini-apps", "src", "tetris", "assets", "za-rus.mp3");
const TETRIS_MUSIC_DESTINATION = join("runtime", "mini-apps", "tetris", "za-rus.mp3");

/**
 * Copies the Tetris music asset only when Tetris is enabled in release feature flags.
 *
 * @param {string} packageDir Release package asset directory.
 * @param {Record<string, any>} [config] Optional parsed root feature-flag config.
 * @returns {Promise<boolean>} True when the asset was copied.
 */
export async function copyTetrisMusicAsset(packageDir, config = undefined) {
  const rootConfig = config ?? JSON.parse(await readFile(resolve("feature-flags.json"), "utf8"));
  if (!isCompiledFeatureEnabled(rootConfig, "tetris")) return false;
  await copyPath(TETRIS_MUSIC_SOURCE, join(packageDir, TETRIS_MUSIC_DESTINATION));
  return true;
}

/**
 * Returns the Tetris music release-relative path.
 *
 * @returns {string} Release package relative path.
 */
export function getTetrisMusicAssetReleasePath() {
  return TETRIS_MUSIC_DESTINATION;
}
