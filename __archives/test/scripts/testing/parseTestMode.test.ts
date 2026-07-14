import assert from "node:assert/strict";
import test from "node:test";
import { parseTestMode } from "../../../scripts/testing/args/parseTestMode.mjs";

test("parseTestMode defaults to the non-release test mode", () => {
  assert.equal(parseTestMode([]), "without-release");
});

test("parseTestMode enables release tests only for --with-release", () => {
  assert.equal(parseTestMode(["--with-release"]), "with-release");
});

test("parseTestMode rejects unsupported arguments", () => {
  assert.throws(
    () => {
      parseTestMode(["--no-release"]);
    },
    /Use "just test" or "just test --with-release"/,
  );
});

test("parseTestMode rejects multiple arguments", () => {
  assert.throws(
    () => {
      parseTestMode(["--with-release", "--extra"]);
    },
    /Use "just test" or "just test --with-release"/,
  );
});
