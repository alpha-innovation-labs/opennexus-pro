#!/usr/bin/env tsx
/**
 * yamlParser.test.ts — E2E tests for the lightweight YAML parser.
 *
 * Verifies that parseSimpleYaml correctly handles:
 *   - Top-level scalar values (strings, numbers, booleans)
 *   - Lists of scalars
 *   - Lists of inline objects
 *   - Nested key-value pairs within list items
 */

import assert from "node:assert/strict";
import test from "node:test";
import { parseSimpleYaml } from "./yamlSessionRunner";

// ────────────────────────────────────────────────────────────────────────
// Scalar parsing tests
// ────────────────────────────────────────────────────────────────────────

test("parseSimpleYaml — top-level string scalar", () => {
  const result = parseSimpleYaml(`sessionName: my-session\ncommand: nexus --resume abc`);
  assert.equal(result.sessionName, "my-session");
  assert.equal(result.command, "nexus --resume abc");
});

test("parseSimpleYaml — top-level number scalar", () => {
  const result = parseSimpleYaml(`waitSeconds: 42`);
  assert.equal(result.waitSeconds, 42);
});

test("parseSimpleYaml — top-level boolean scalar", () => {
  const result = parseSimpleYaml(`enabled: true\ndisabled: false`);
  assert.equal(result.enabled, true);
  assert.equal(result.disabled, false);
});

test("parseSimpleYaml — quoted string values", () => {
  const result = parseSimpleYaml(`name: "hello world"\npath: '/opt/bin/nexus'`);
  assert.equal(result.name, "hello world");
  assert.equal(result.path, "/opt/bin/nexus");
});

// ────────────────────────────────────────────────────────────────────────
// List parsing tests
// ────────────────────────────────────────────────────────────────────────

test("parseSimpleYaml — list of scalars", () => {
  const result = parseSimpleYaml(`tags:\n  - alpha\n  - beta\n  - gamma`);
  assert.ok(Array.isArray(result.tags));
  assert.deepEqual(result.tags, ["alpha", "beta", "gamma"]);
});

test("parseSimpleYaml — inline list of scalars", () => {
  const result = parseSimpleYaml(`tags: [alpha, beta, gamma]`);
  assert.ok(Array.isArray(result.tags));
  assert.deepEqual(result.tags, ["alpha", "beta", "gamma"]);
});

test("parseSimpleYaml — list of inline objects", () => {
  const yaml = `interactions:
  - { type: key, value: "hello", delay: 500 }
  - { type: wait, value: 2000 }`;
  const result = parseSimpleYaml(yaml);
  assert.ok(Array.isArray(result.interactions));
  assert.equal(result.interactions.length, 2);

  const first = result.interactions[0] as Record<string, unknown>;
  assert.equal(first.type, "key");
  assert.equal(first.value, "hello");
  assert.equal(first.delay, 500);

  const second = result.interactions[1] as Record<string, unknown>;
  assert.equal(second.type, "wait");
  assert.equal(second.value, 2000);
});

test("parseSimpleYaml — mixed list (scalars and objects)", () => {
  const yaml = `steps:
  - { type: key, value: "ls" }
  - simple_scalar
  - { type: wait, value: 1000 }`;
  const result = parseSimpleYaml(yaml);
  assert.ok(Array.isArray(result.steps));
  assert.equal(result.steps.length, 3);
  assert.equal((result.steps[0] as Record<string, unknown>).type, "key");
  assert.equal(result.steps[1], "simple_scalar");
  assert.equal((result.steps[2] as Record<string, unknown>).type, "wait");
});

// ────────────────────────────────────────────────────────────────────────
// Edge cases
// ────────────────────────────────────────────────────────────────────────

test("parseSimpleYaml — empty file", () => {
  const result = parseSimpleYaml("");
  assert.deepEqual(result, {});
});

test("parseSimpleYaml — comments and blank lines ignored", () => {
  const yaml = `# This is a comment
sessionName: test

# Another comment
command: nexus`;
  const result = parseSimpleYaml(yaml);
  assert.equal(result.sessionName, "test");
  assert.equal(result.command, "nexus");
});

test("parseSimpleYaml — inline object with empty braces", () => {
  const result = parseSimpleYaml(`empty: {}`);
  assert.deepEqual(result.empty, {});
});
