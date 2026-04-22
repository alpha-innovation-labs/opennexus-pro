import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { FffRuntime } from "../../../src/extensions/fff/runtime/FffRuntime.js";
import { clearRuntimeForCwd, getRuntimeForCwd } from "../../../src/extensions/fff/runtime/runtimeStore.js";
import { createFffTestContext } from "../../support/fff/createFffTestContext.js";
import { createRegisterFffExtensionHarness } from "../../support/fff/createRegisterFffExtensionHarness.js";

test("registerFffExtension defers FileFinder initialization until first use", { concurrency: false }, async () => {
  const originalEnsure = FffRuntime.prototype.ensure;
  const originalDispose = FffRuntime.prototype.dispose;
  let ensureCalls = 0;
  let disposeCalls = 0;

  FffRuntime.prototype.ensure = async function ensureStub() {
    ensureCalls += 1;
    return {} as never;
  };
  FffRuntime.prototype.dispose = function disposeStub() {
    disposeCalls += 1;
  };

  try {
    const { handlers } = createRegisterFffExtensionHarness();
    const { ctx, notifications } = createFffTestContext("/tmp/nexus-fff-lazy-startup");

    await handlers.get("session_start")?.({}, ctx);

    assert.equal(ensureCalls, 0);
    assert.ok(getRuntimeForCwd(ctx.cwd) instanceof FffRuntime);
    assert.deepEqual(notifications, []);

    await handlers.get("session_shutdown")?.({}, ctx);

    assert.equal(disposeCalls, 1);
    assert.equal(getRuntimeForCwd(ctx.cwd), undefined);
  } finally {
    FffRuntime.prototype.ensure = originalEnsure;
    FffRuntime.prototype.dispose = originalDispose;
    clearRuntimeForCwd("/tmp/nexus-fff-lazy-startup");
  }
});

test("FFF-backed read and grep initialize lazily on first tool use", { concurrency: false }, async () => {
  const cwd = await mkdtemp(join(tmpdir(), "nexus-fff-lazy-tools-"));
  const filePath = join(cwd, "note.txt");
  const originalEnsure = FffRuntime.prototype.ensure;
  const originalResolvePath = FffRuntime.prototype.resolvePath;
  const originalTrackQuery = FffRuntime.prototype.trackQuery;
  const originalGrepSearch = FffRuntime.prototype.grepSearch;
  let ensureCalls = 0;

  await writeFile(filePath, "hello from lazy read\n", "utf8");

  FffRuntime.prototype.ensure = async function ensureStub() {
    ensureCalls += 1;
    return {} as never;
  };
  FffRuntime.prototype.resolvePath = async function resolvePathStub(query: string) {
    await this.ensure();
    return {
      query,
      absolutePath: filePath,
      relativePath: "note.txt",
      pathType: "file",
      candidates: [],
    } as never;
  };
  FffRuntime.prototype.trackQuery = async function trackQueryStub() {
    return undefined;
  };
  FffRuntime.prototype.grepSearch = async function grepSearchStub() {
    await this.ensure();
    return {
      items: [],
      formatted: "note.txt:1:hello from lazy grep",
      nextCursor: undefined,
      scope: undefined,
      constraintQuery: undefined,
    };
  };

  try {
    const { handlers, tools } = createRegisterFffExtensionHarness();
    const { ctx } = createFffTestContext(cwd);
    const readTool = tools.get("read");
    const grepTool = tools.get("grep");

    assert.ok(readTool);
    assert.ok(grepTool);

    await handlers.get("session_start")?.({}, ctx);
    assert.equal(ensureCalls, 0);

    const readResult = await readTool!.execute("tool-read", { path: "@note" }, new AbortController().signal, () => undefined, ctx);
    assert.match(readResult.content[0]?.text ?? "", /hello from lazy read/);
    assert.equal(ensureCalls, 1);

    const grepResult = await grepTool!.execute(
      "tool-grep",
      { pattern: "hello", mode: "plain" },
      new AbortController().signal,
      () => undefined,
      ctx,
    );
    assert.match(grepResult.content[0]?.text ?? "", /lazy grep/);
    assert.equal(ensureCalls, 2);

    await handlers.get("session_shutdown")?.({}, ctx);
  } finally {
    FffRuntime.prototype.ensure = originalEnsure;
    FffRuntime.prototype.resolvePath = originalResolvePath;
    FffRuntime.prototype.trackQuery = originalTrackQuery;
    FffRuntime.prototype.grepSearch = originalGrepSearch;
    clearRuntimeForCwd(cwd);
    await rm(cwd, { recursive: true, force: true });
  }
});

test("FFF initialization failures are reported on first use instead of startup", { concurrency: false }, async () => {
  const originalEnsure = FffRuntime.prototype.ensure;
  const originalResolvePath = FffRuntime.prototype.resolvePath;
  const originalGrepSearch = FffRuntime.prototype.grepSearch;

  FffRuntime.prototype.ensure = async function ensureStub() {
    (this as unknown as { reportUnavailable?: (message: string) => void }).reportUnavailable?.("FFF init exploded");
    throw new Error("FFF init exploded");
  };
  FffRuntime.prototype.resolvePath = async function resolvePathStub() {
    await this.ensure();
    throw new Error("unreachable");
  };
  FffRuntime.prototype.grepSearch = async function grepSearchStub() {
    await this.ensure();
    throw new Error("unreachable");
  };

  try {
    const { handlers, tools } = createRegisterFffExtensionHarness();
    const { ctx, notifications } = createFffTestContext("/tmp/nexus-fff-lazy-errors");
    const readTool = tools.get("read");
    const grepTool = tools.get("grep");

    assert.ok(readTool);
    assert.ok(grepTool);

    await handlers.get("session_start")?.({}, ctx);
    assert.deepEqual(notifications, []);

    const readResult = await readTool!.execute("tool-read", { path: "@broken" }, new AbortController().signal, () => undefined, ctx);
    assert.match(readResult.content[0]?.text ?? "", /FFF init exploded/);
    assert.deepEqual(notifications, [{ message: "fff unavailable: FFF init exploded", level: "warning" }]);

    const grepResult = await grepTool!.execute(
      "tool-grep",
      { pattern: "broken", mode: "plain" },
      new AbortController().signal,
      () => undefined,
      ctx,
    );
    assert.match(grepResult.content[0]?.text ?? "", /FFF init exploded/);
    assert.equal(notifications.length, 1);

    await handlers.get("session_shutdown")?.({}, ctx);
  } finally {
    FffRuntime.prototype.ensure = originalEnsure;
    FffRuntime.prototype.resolvePath = originalResolvePath;
    FffRuntime.prototype.grepSearch = originalGrepSearch;
    clearRuntimeForCwd("/tmp/nexus-fff-lazy-errors");
  }
});
