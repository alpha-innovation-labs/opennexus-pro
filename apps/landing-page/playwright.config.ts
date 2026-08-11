import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: false,
	reporter: "list",
	use: {
		baseURL: "http://127.0.0.1:4322",
		trace: "on-first-retry",
		viewport: { width: 1920, height: 1080 },
	},
	webServer: {
		command: "PORT=4322 npm run dev",
		url: "http://127.0.0.1:4322",
		reuseExistingServer: false,
		timeout: 120_000,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
