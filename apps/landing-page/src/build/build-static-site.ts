import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { copyDirectory } from "./copy-directory.js";
import { writePage } from "./write-page.js";

const appRoot = resolve(import.meta.dirname, "../..");
const distDir = resolve(appRoot, "dist");

await rm(distDir, { recursive: true, force: true });
await mkdir(resolve(distDir, "styles"), { recursive: true });
await copyDirectory(resolve(appRoot, "public"), distDir);
await copyDirectory(resolve(appRoot, "src/styles"), resolve(distDir, "styles"));
await writePage(resolve(distDir, "index.html"));
console.log(`Built landing page at ${distDir}`);
