import { cp, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { runCommand } from "./runCommand.mjs";

/**
 * Downloads one npm package tarball and mirrors its package files into the target directory.
 *
 * @param {{ source: string, target: string }} entry Vendor package entry.
 * @returns {Promise<void>}
 */
export async function extractVendorPackage(entry) {
	const workspace = await mkdtemp(join(tmpdir(), "nexus-vendor-"));
	try {
		const packed = (
			await runCommand("npm", ["pack", entry.source, "--silent"], {
				cwd: workspace,
			})
		)
			.trim()
			.split("\n")
			.at(-1);
		if (!packed)
			throw new Error(`npm pack returned no tarball for ${entry.source}`);
		const extractDir = join(workspace, "package");
		await mkdir(extractDir, { recursive: true });
		await runCommand(
			"tar",
			["-xzf", basename(packed), "-C", extractDir, "--strip-components=1"],
			{ cwd: workspace },
		);
		await rm(resolve(entry.target), { recursive: true, force: true });
		await mkdir(resolve(entry.target), { recursive: true });
		await cp(extractDir, resolve(entry.target), { recursive: true });
	} finally {
		await rm(workspace, { recursive: true, force: true });
	}
}
