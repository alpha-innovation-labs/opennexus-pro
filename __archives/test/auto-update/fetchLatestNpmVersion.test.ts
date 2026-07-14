import assert from "node:assert/strict";
import test from "node:test";
import { fetchLatestNpmVersion } from "../../packages/extension-core/src/auto-update/registry/fetchLatestNpmVersion.js";

test("auto-update fetches latest npm dist-tag from the registry", async () => {
	const calls: string[] = [];
	const latest = await fetchLatestNpmVersion("@scope/pkg", async (url) => {
		calls.push(String(url));
		return new Response(JSON.stringify({ "dist-tags": { latest: "1.2.3" } }), { status: 200 });
	});

	assert.equal(latest, "1.2.3");
	assert.deepEqual(calls, ["https://registry.npmjs.org/%40scope%2Fpkg"]);
});

test("auto-update reports invalid registry responses", async () => {
	await assert.rejects(
		() => fetchLatestNpmVersion("pkg", async () => new Response("{}", { status: 200 })),
		/npm registry response did not include a latest dist-tag/u,
	);
});
