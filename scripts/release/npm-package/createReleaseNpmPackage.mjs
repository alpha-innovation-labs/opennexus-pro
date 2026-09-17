/**
 * Creates the temporary npm package that installs the Nexus release.
 *
 * The release is a single esbuild-bundled ESM file (dist/apps/tui/bundled/index.js)
 * plus the non-code runtime assets the app reads from PI_PACKAGE_DIR at startup
 * (system prompt, themes, prompt-template commands, app-default settings).
 *
 * Layout produced:
 *   .release/npm-package/
 *     package.json
 *     bin/nexus                 # bash launcher (sets PI_PACKAGE_DIR, execs node)
 *     nexus.js                  # the esbuild bundle
 *     package/                  # PI_PACKAGE_DIR asset root
 *       package.json            # runtime version and piConfig metadata
 *       prompts/base-system-prompt/system_prompt.md
 *       theme/<themes>
 *       dist/modes/interactive/theme/{dark,light}.json
 *       commands/<commands>
 *       runtime/config/default-settings/settings.json
 *
 * Pure-JS dependencies are already inlined into the bundle; only the native
 * addons (node-pty, fff, ffi-rs, ast-grep) plus a couple of runtime-loaded JS
 * packages are declared as npm dependencies so they are present when the bundle
 * requires them at runtime.
 */
import { chmod, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "..", "..");
const BUNDLE_PATH = resolve(ROOT, "dist/apps/tui/bundled/index.js");
const PACKAGE_DIR = resolve(ROOT, ".release/npm-package");
const AGENT_ASSET_ROOT = "package";

/**
 * Runtime npm dependencies required by the bundled executable. Native addons are
 * mandatory (they cannot be bundled); the rest are kept because the app may load
 * them dynamically at runtime.
 */
const RUNTIME_DEPENDENCIES = [
	"@ast-grep/napi",
	"@ff-labs/fff-node",
	"@ff-labs/fff-bin-darwin-arm64",
	"@xterm/headless",
	"ffi-rs",
	"@yuuang/ffi-rs-darwin-arm64",
	"linkedom",
	"node-pty",
	"turndown",
];

const PORTABLE_POSTINSTALL_SCRIPT = String.raw`
const fs=require('fs');
const path=require('path');
const cp=require('child_process');
function linuxLibc(){try{return cp.execSync('ldd --version 2>&1',{encoding:'utf8',timeout:5000}).toLowerCase().includes('musl')?'musl':'gnu'}catch{return 'gnu'}}
function ffiSuffix(){const p=process.platform,a=process.arch,l=p==='linux'?linuxLibc():undefined;if(p==='darwin'&&(a==='arm64'||a==='x64'))return 'darwin-'+a;if(p==='linux'&&a==='arm64')return 'linux-arm64-'+l;if(p==='linux'&&a==='x64')return 'linux-x64-'+l;if(p==='linux'&&a==='arm')return 'linux-arm-gnueabihf';if(p==='win32'&&a==='arm64')return 'win32-arm64-msvc';if(p==='win32'&&a==='x64')return 'win32-x64-msvc';if(p==='win32'&&a==='ia32')return 'win32-ia32-msvc';return undefined}
const suffix=ffiSuffix();
if(suffix){const file='ffi-rs.'+suffix+'.node';const src=path.join(process.cwd(),'node_modules','@yuuang','ffi-rs-'+suffix,file);const dst=path.join(process.cwd(),'node_modules','ffi-rs',file);if(fs.existsSync(src)){fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst)}}
const spawnHelper=path.join(process.cwd(),'node_modules','node-pty','prebuilds','darwin-arm64','spawn-helper');
if(fs.existsSync(spawnHelper))fs.chmodSync(spawnHelper,0o755);
`;

/**
 * Stages the non-code runtime assets under the package asset root.
 *
 * @param {string} packageDir npm package directory.
 * @returns {Promise<void>}
 */
export async function stageReleasePackageAssets(packageDir) {
	const assetRoot = join(packageDir, AGENT_ASSET_ROOT);
	const runtimeConfig = resolve(
		ROOT,
		"packages/nexus-runtime/src/config",
	);

	// System prompt (read directly from PI_PACKAGE_DIR at startup).
	const promptTarget = join(
		assetRoot,
		"prompts/base-system-prompt/system_prompt.md",
	);
	await mkdir(join(assetRoot, "prompts/base-system-prompt"), {
		recursive: true,
	});
	await cp(
		join(runtimeConfig, "prompts/system_prompt.md"),
		promptTarget,
	);

	// App-default settings (read directly from PI_PACKAGE_DIR).
	const settingsTarget = join(
		assetRoot,
		"runtime/config/default-settings/settings.json",
	);
	await mkdir(join(assetRoot, "runtime/config/default-settings"), {
		recursive: true,
	});
	await cp(
		join(runtimeConfig, "default-settings/settings.json"),
		settingsTarget,
	);

	// Pi's Node runtime loads both built-in themes from this exact layout under
	// PI_PACKAGE_DIR, independently of the custom Nexus themes below. These are
	// required assets: let a missing source fail packaging, not installed startup.
	const piDist = dirname(fileURLToPath(import.meta.resolve("@earendil-works/pi-coding-agent")));
	const builtinThemesTarget = join(assetRoot, "dist/modes/interactive/theme");
	await mkdir(builtinThemesTarget, { recursive: true });
	for (const name of ["dark.json", "light.json"]) {
		await cp(
			join(piDist, "modes/interactive/theme", name),
			join(builtinThemesTarget, name),
		);
	}

	// Themes (listed + copied into the agent dir at startup). Missing dir is a
	// documented no-op, so stage only when present.
	const themesSource = join(runtimeConfig, "themes");
	try {
		await cp(themesSource, join(assetRoot, "theme"), { recursive: true });
	} catch {
		/* no bundled themes yet */
	}

	// Prompt-template commands. Missing dir is a no-op for the app.
	const commandsSource = join(runtimeConfig, "commands");
	try {
		await cp(commandsSource, join(assetRoot, "commands"), {
			recursive: true,
		});
	} catch {
		/* no bundled commands yet */
	}
}

/**
 * Creates the temporary npm package that installs the Nexus release.
 *
 * @param {string} packageDir Output npm package directory.
 * @returns {Promise<void>}
 */
export async function createReleaseNpmPackage(packageDir = PACKAGE_DIR) {
	const packageJson = JSON.parse(await readFile(resolve(ROOT, "package.json"), "utf8"));
	const version = String(packageJson.version ?? "0.1.0");
	const piConfig = packageJson.piConfig ?? {
		name: "nexus",
		configDir: ".nexus",
	};
	const rootDependencies = packageJson.dependencies ?? {};

	const dependencies = {};
	for (const name of RUNTIME_DEPENDENCIES) {
		if (rootDependencies[name]) dependencies[name] = rootDependencies[name];
	}

	await rm(packageDir, { recursive: true, force: true });
	await mkdir(join(packageDir, "bin"), { recursive: true });
	await mkdir(packageDir, { recursive: true });

	// The bundled executable.
	const bundleTarget = join(packageDir, "nexus.js");
	await cp(BUNDLE_PATH, bundleTarget);

	await stageReleasePackageAssets(packageDir);

	const postinstall = `node -e ${JSON.stringify(
		PORTABLE_POSTINSTALL_SCRIPT.trim().replace(/\n/g, " "),
	)}`;

	await writeFile(
		join(packageDir, "package.json"),
		`${JSON.stringify(
			{
				name: "opennexus",
				version,
				type: "module",
				piConfig,
				publishConfig: {
					registry: "https://registry.npmjs.org/",
					access: "public",
				},
				scripts: { postinstall },
				bin: { nexus: "bin/nexus", opennexus: "bin/nexus" },
				dependencies,
				files: ["bin", "nexus.js", AGENT_ASSET_ROOT, "package.json"],
				os: [process.platform],
				cpu: [process.arch],
			},
			null,
			2,
		)}\n`,
		"utf8",
	);

	// Runtime metadata readers resolve package.json under PI_PACKAGE_DIR, not
	// the npm installation root. Keep both copies in sync for each release.
	await cp(
		join(packageDir, "package.json"),
		join(packageDir, AGENT_ASSET_ROOT, "package.json"),
	);

	// Launcher: points PI_PACKAGE_DIR at the staged assets and execs the bundle.
	const launcherPath = join(packageDir, "bin", "nexus");
	await writeFile(
		launcherPath,
		[
			"#!/usr/bin/env bash",
			"set -euo pipefail",
			"",
			"SCRIPT_PATH=\"$(perl -MCwd=realpath -e 'print realpath(shift)' \"$0\")\"",
			'BIN_DIR="$(cd "$(dirname "${SCRIPT_PATH}")" && pwd)"',
			'PACKAGE_DIR="$(cd "${BIN_DIR}/.." && pwd)"',
			'export PI_PACKAGE_DIR="${PACKAGE_DIR}/package"',
			// Herdr matches the agent by canonical executable name; keep the
			// "mastracode" title on the spawned process for parity with the binary.
			'exec -a mastracode node "${PACKAGE_DIR}/nexus.js" "$@"',
			"",
		].join("\n"),
		"utf8",
	);
	await chmod(join(packageDir, "nexus.js"), 0o755);
	await chmod(launcherPath, 0o755);
}

// Run as a script (not when imported as a module in tests).
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	await createReleaseNpmPackage();
}
