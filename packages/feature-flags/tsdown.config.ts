import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: ['src/index.ts'],

	clean: true,
 	target: 'node26',
	deps: {
		neverBundle: true,
	},
})
