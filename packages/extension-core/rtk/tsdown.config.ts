import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
  dts: true,

	format: "esm",
	clean: true,
	target: "node26",
	deps: {
		neverBundle: true,
	},
});
