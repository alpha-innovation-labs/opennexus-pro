import assert from "node:assert/strict";
import test from "node:test";
import { fetchJupiterTokenMetadata } from "../../packages/mini-apps/src/wallet/metadata/fetchJupiterTokenMetadata.js";

test("fetchJupiterTokenMetadata returns empty metadata when fetch fails", async () => {
	const originalFetch = globalThis.fetch;
	globalThis.fetch = (() => Promise.reject(new TypeError("fetch failed"))) as typeof fetch;
	try {
		assert.deepEqual(await fetchJupiterTokenMetadata(["MintA"]), {});
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test("fetchJupiterTokenMetadata reads Jupiter lite API image fields", async () => {
	const originalFetch = globalThis.fetch;
	globalThis.fetch = (async () => new Response(JSON.stringify([{ id: "MintA", symbol: "TOK", name: "Token", icon: "https://img.test/tok.png" }]))) as typeof fetch;
	try {
		assert.deepEqual(await fetchJupiterTokenMetadata(["MintA"]), {
			MintA: { mint: "MintA", symbol: "TOK", name: "Token", imageUrl: "https://img.test/tok.png" },
		});
	} finally {
		globalThis.fetch = originalFetch;
	}
});
