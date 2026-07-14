import assert from "node:assert/strict";
import test from "node:test";
import { isNetworkError } from "../../packages/extension-core/src/auto-update/runtime/checkForNexusUpdate.js";

test("auto-update classifies fetch-failed as network error", () => {
	assert.equal(isNetworkError(new Error("fetch failed")), true);
});

test("auto-update classifies NetworkError as network error", () => {
	assert.equal(isNetworkError(new Error("NetworkError when attempting to fetch resource")), true);
});

test("auto-update classifies net::ERR as network error", () => {
	assert.equal(isNetworkError(new Error("net::ERR_NAME_NOT_RESOLVED")), true);
});

test("auto-update classifies ENOTFOUND as network error", () => {
	assert.equal(isNetworkError(new Error("getaddrinfo ENOTFOUND registry.npmjs.org")), true);
});

test("auto-update classifies ECONNREFUSED as network error", () => {
	assert.equal(isNetworkError(new Error("connect ECONNREFUSED")), true);
});

test("auto-update classifies getaddrinfo as network error", () => {
	assert.equal(isNetworkError(new Error("getaddrinfo ENODATA")), true);
});

test("auto-update classifies generic network as network error", () => {
	assert.equal(isNetworkError(new Error("Network request failed")), true);
});

test("auto-update classifies HTTP errors as non-network", () => {
	assert.equal(isNetworkError(new Error("npm registry request failed with HTTP 404")), false);
});

test("auto-update classifies invalid response as non-network", () => {
	assert.equal(isNetworkError(new Error("npm registry response did not include a latest dist-tag")), false);
});

test("auto-update classifies unknown errors as non-network", () => {
	assert.equal(isNetworkError(new Error("Something weird happened")), false);
});

test("auto-update classifies non-strings as non-network", () => {
	assert.equal(isNetworkError({ code: "EUNKNOWN" }), false);
	assert.equal(isNetworkError(null), false);
	assert.equal(isNetworkError(undefined), false);
});
