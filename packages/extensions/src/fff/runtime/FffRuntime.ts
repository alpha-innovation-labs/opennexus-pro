import type { FileFinder, GrepMode } from "@ff-labs/fff-node";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import type { GrepSearchResponse, ResolvedPath, StoredGrepContinuation } from "../shared/types.js";
import { buildGrepOutput } from "./buildGrepOutput.js";
import { combineConstraints } from "./combineConstraints.js";
import { createFinder } from "./createFinder.js";
import { createFinderError } from "./createFinderError.js";
import { createRequestKey } from "./createRequestKey.js";
import { getRuntimePaths } from "./getRuntimePaths.js";
import { loadFffNode } from "./loadFffNode.js";
import { nativeConstraintForGlob } from "./nativeConstraintForGlob.js";
import { nativeConstraintForScope } from "./nativeConstraintForScope.js";
import { normalizeCandidate } from "./normalizeCandidate.js";
import { normalizePathQuery } from "./normalizePathQuery.js";
import { resolveExistingPath } from "./resolveExistingPath.js";
import { resolveProjectRoot } from "./resolveProjectRoot.js";
import { resolveTrackedPath } from "./resolveTrackedPath.js";
import { shouldAutoResolveCandidate } from "./shouldAutoResolveCandidate.js";
import { stripPathLocation } from "./stripPathLocation.js";

const DEFAULT_FILE_LIMIT = 8;
const DEFAULT_GREP_LIMIT = 100;
const GREP_CURSOR_PREFIX = "fff-grep:";
const MAX_CURSOR_STATES = 64;

/**
 * Manages one project-scoped FFF runtime.
 */
export class FffRuntime {
  private finder?: FileFinder;
  private projectRoot?: string;
  private grepCursorCount = 0;
  private readonly grepContinuations = new Map<string, StoredGrepContinuation>();

  constructor(
    readonly cwd: string,
    private readonly reportUnavailable?: (message: string) => void,
  ) {}

  /** Ensures the native FFF finder is initialized. */
  async ensure(): Promise<FileFinder> {
    if (this.finder) return this.finder;
    try {
      const projectRoot = await resolveProjectRoot(this.cwd);
      const runtimePaths = getRuntimePaths(projectRoot);
      await mkdir(runtimePaths.rootDir, { recursive: true });
      await mkdir(runtimePaths.dbDir, { recursive: true });
      const { FileFinder } = await loadFffNode();
      const created = createFinder(FileFinder, {
        basePath: projectRoot,
        aiMode: true,
        frecencyDbPath: runtimePaths.frecencyDbPath,
        historyDbPath: runtimePaths.historyDbPath,
      });
      if (!created.ok) {
        throw new Error(`FFF create file finder failed: ${created.error}`);
      }
      this.projectRoot = projectRoot;
      this.finder = created.value;
      return this.finder;
    } catch (error) {
      this.reportUnavailable?.(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /** Disposes the active finder and clears continuation state. */
  dispose(): void {
    this.finder?.destroy();
    this.finder = undefined;
    this.grepContinuations.clear();
  }

  /** Returns ranked fuzzy file candidates. */
  async searchFileCandidates(query: string, limit = DEFAULT_FILE_LIMIT) {
    const normalizedQuery = normalizePathQuery(query);
    if (!normalizedQuery) return [];
    const finder = await this.ensure();
    const search = finder.fileSearch(normalizedQuery, { pageSize: Math.max(limit, DEFAULT_FILE_LIMIT) });
    if (!search.ok) throw createFinderError("fileSearch", search.error);
    return search.value.items.slice(0, limit).map((item, index) => normalizeCandidate(item, search.value.scores[index]));
  }

  /** Tracks a selected file against the original user query. */
  async trackQuery(query: string, selectedPath: string): Promise<void> {
    const finder = await this.ensure();
    const projectRoot = this.projectRoot ?? await resolveProjectRoot(this.cwd);
    this.projectRoot = projectRoot;
    const trackedPath = resolveTrackedPath(projectRoot, this.cwd, selectedPath).replace(/\\/g, "/");
    const tracked = finder.trackQuery(normalizePathQuery(query), trackedPath);
    if (!tracked.ok) throw createFinderError("trackQuery", tracked.error);
  }

  /** Resolves an approximate path into one concrete file-system path. */
  async resolvePath(query: string, allowDirectory = false): Promise<ResolvedPath> {
    const normalizedQuery = normalizePathQuery(query);
    if (!normalizedQuery) {
      throw new Error("Path query is empty.");
    }
    const basePath = this.projectRoot ?? await resolveProjectRoot(this.cwd);
    this.projectRoot = basePath;
    const pathOnlyQuery = stripPathLocation(normalizedQuery);
    const direct = await resolveExistingPath(this.cwd, basePath, pathOnlyQuery, allowDirectory);
    if (direct) {
      return { query, ...direct, candidates: [] };
    }

    const finder = await this.ensure();
    const search = finder.fileSearch(normalizedQuery, { pageSize: DEFAULT_FILE_LIMIT });
    if (!search.ok) throw createFinderError("fileSearch", search.error);
    const candidates = search.value.items
      .slice(0, DEFAULT_FILE_LIMIT)
      .map((item, index) => normalizeCandidate(item, search.value.scores[index]))
      .filter((candidate) => allowDirectory || !candidate.item.relativePath.endsWith("/"));
    if (!shouldAutoResolveCandidate(candidates[0], candidates[1])) {
      const formatted = candidates.map((candidate, index) => `${index + 1}. ${candidate.item.relativePath}`).join("\n");
      throw new Error(formatted ? `Could not resolve \"${query}\" uniquely.\nTop matches:\n${formatted}` : `No files matched \"${query}\".`);
    }

    const top = candidates[0]!;
    return {
      query,
      absolutePath: resolve(basePath, top.item.relativePath),
      relativePath: top.item.relativePath,
      pathType: "file",
      location: search.value.location,
      candidates,
    };
  }

  /** Runs indexed FFF grep with simple continuation support. */
  async grepSearch(args: {
    pattern: string;
    mode: GrepMode;
    pathQuery?: string;
    glob?: string;
    context?: number;
    limit?: number;
    cursor?: string;
  }): Promise<GrepSearchResponse> {
    const finder = await this.ensure();
    const scope = args.pathQuery ? await this.resolvePath(args.pathQuery, true) : undefined;
    const constraintQuery = combineConstraints(nativeConstraintForScope(scope), nativeConstraintForGlob(args.glob));
    const requestKey = createRequestKey({ ...args, constraintQuery });
    const continuation = args.cursor ? this.grepContinuations.get(args.cursor) : undefined;
    if (args.cursor?.startsWith(GREP_CURSOR_PREFIX) && !continuation) {
      throw new Error("Invalid or expired grep cursor.");
    }
    if (continuation && continuation.requestKey !== requestKey) {
      throw new Error("This grep cursor belongs to a different query. Re-run without cursor.");
    }

    const request = finder.grep(constraintQuery ? `${constraintQuery} ${args.pattern}` : args.pattern, {
      mode: args.mode,
      cursor: continuation?.engineCursor ?? null,
      beforeContext: args.context ?? 0,
      afterContext: args.context ?? 0,
      maxMatchesPerFile: 200,
    });
    if (!request.ok) throw createFinderError("grep", request.error);

    const limit = args.limit ?? DEFAULT_GREP_LIMIT;
    const items = [...(continuation?.remainingItems ?? []), ...request.value.items].slice(0, limit);
    const remainingItems = [...(continuation?.remainingItems ?? []), ...request.value.items].slice(limit);
    const nextCursor = remainingItems.length > 0 || request.value.nextCursor !== null
      ? this.storeContinuation({ requestKey, remainingItems, engineCursor: request.value.nextCursor })
      : undefined;

    return {
      items,
      formatted: buildGrepOutput(items, nextCursor),
      nextCursor,
      scope,
      constraintQuery,
    };
  }

  /**
   * Stores one grep continuation page and returns its cursor token.
   *
   * @param state Continuation state.
   * @returns Cursor token.
   */
  private storeContinuation(state: StoredGrepContinuation): string {
    const cursor = `${GREP_CURSOR_PREFIX}${++this.grepCursorCount}`;
    this.grepContinuations.set(cursor, state);
    while (this.grepContinuations.size > MAX_CURSOR_STATES) {
      const firstKey = this.grepContinuations.keys().next().value;
      if (!firstKey) break;
      this.grepContinuations.delete(firstKey);
    }
    return cursor;
  }
}
