import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: ['src/index.ts'],
	dts: true,
	clean: true,
	target: 'node20',
	deps: {
		neverBundle: true,
	},
})
