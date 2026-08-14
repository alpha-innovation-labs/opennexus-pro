import { expect, test } from "@playwright/test";

test.describe("Nexus feature showcase", () => {
	test("mounts one showcase terminal player without duplicate ids", async ({
		page,
	}) => {
		await page.goto("/");
		await page.locator("#code-lsp").scrollIntoViewIfNeeded();

		await expect(page.locator(".showcase-terminal-player")).toHaveCount(1);
		await expect(page.locator(".showcase-terminal-figure")).toBeVisible();
		await expect(
			page.locator(".showcase-terminal-player .ap-player"),
		).toBeVisible({ timeout: 10_000 });

		const duplicateIds = await page.evaluate(() => {
			const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map(
				(element) => element.id,
			);
			return ids.filter((id, index) => ids.indexOf(id) !== index);
		});

		expect(duplicateIds).toEqual([]);
	});

	test("settles the terminal before the first showcase item is passed", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/");
		const featureTop = await page
			.locator("#features")
			.evaluate(
				(element) => element.getBoundingClientRect().top + window.scrollY,
			);
		await page.evaluate(
			(scrollTop) => window.scrollTo(0, scrollTop),
			featureTop,
		);
		await page.waitForTimeout(250);

		const introLayout = await page.evaluate(() => {
			const terminal = document
				.querySelector<HTMLElement>(".showcase-terminal-figure")
				?.getBoundingClientRect();
			const copy = document.querySelector<HTMLElement>(".feature-story-copy");
			if (!terminal || !copy) return null;
			return {
				terminalCenterDelta: Math.abs(
					terminal.left + terminal.width / 2 - window.innerWidth / 2,
				),
				copyOpacity: Number(window.getComputedStyle(copy).opacity),
			};
		});

		await page.evaluate(
			(scrollTop) => window.scrollTo(0, scrollTop + 160),
			featureTop,
		);
		await page.waitForTimeout(250);

		const settledLayout = await page.evaluate(() => {
			const terminal = document
				.querySelector<HTMLElement>(".showcase-terminal-figure")
				?.getBoundingClientRect();
			const copy = document
				.querySelector<HTMLElement>(".feature-story-copy")
				?.getBoundingClientRect();
			const firstTitle = document
				.querySelector<HTMLElement>("#code-lsp [data-showcase-story-title]")
				?.getBoundingClientRect();
			if (!terminal || !copy || !firstTitle) return null;
			return {
				activeExampleId: document.querySelector<HTMLElement>(
					".showcase-example.opacity-100",
				)?.id,
				copyVisible: (() => {
					const el = document.querySelector<HTMLElement>(".feature-story-copy");
					if (!el) return false;
					return Number(window.getComputedStyle(el).opacity) > 0.9;
				})(),
				firstTitleCenterDelta: Math.abs(
					firstTitle.top + firstTitle.height / 2 - window.innerHeight / 2,
				),
				progress: (() => {
					const el = document.querySelector<HTMLElement>(".feature-story-grid");
					if (!el) return "";
					return window
						.getComputedStyle(el)
						.getPropertyValue("--showcase-story-progress");
				})(),
				terminalCenterDelta: Math.abs(
					terminal.top + terminal.height / 2 - window.innerHeight / 2,
				),
				terminalLeftOfCopy: terminal.right < copy.left,
			};
		});

		expect(introLayout).not.toBeNull();
		expect(introLayout?.terminalCenterDelta).toBeLessThan(220);
		expect(introLayout?.copyOpacity).toBeLessThan(0.2);
		expect(settledLayout).not.toBeNull();
		expect(settledLayout?.progress).toBe("1.0000");
		expect(settledLayout?.activeExampleId).toBe("code-lsp");
		expect(settledLayout?.firstTitleCenterDelta).toBeLessThan(80);
		expect(settledLayout?.terminalCenterDelta).toBeLessThan(120);
		expect(settledLayout?.terminalLeftOfCopy).toBe(true);
		expect(settledLayout?.copyVisible).toBe(true);
	});

	test("shows attached showcase navigation only after the terminal settles", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1920, height: 1080 });
		await page.goto("/");
		const featureTop = await page
			.locator("#features")
			.evaluate(
				(element) => element.getBoundingClientRect().top + window.scrollY,
			);
		await page.evaluate(
			(scrollTop) => window.scrollTo(0, scrollTop),
			featureTop,
		);
		await page.waitForTimeout(250);

		await expect(page.locator(".feature-sticky-nav")).toHaveCSS("opacity", "0");

		await page.evaluate(
			(scrollTop) => window.scrollTo(0, scrollTop + 160),
			featureTop,
		);
		await page.waitForTimeout(250);

		await expect(
			page.getByRole("navigation", { name: "Feature showcase navigation" }),
		).toBeVisible();
		await expect(
			page.locator('[data-showcase-major-link="core-plugins"]'),
		).toBeVisible();
		await expect(
			page.locator('[data-showcase-major-link="custom-plugins"]'),
		).toBeVisible();
		await expect(
			page.locator('[data-showcase-major-link="mini-apps"]'),
		).toBeVisible();
		await expect(
			page.locator('[data-showcase-child-link="code-lsp"]'),
		).toBeVisible();
		await expect(
			page.locator('[data-showcase-child-link="code-fast-files"]'),
		).toBeVisible();
		await expect(
			page.locator('[data-showcase-child-link="code-web-mcp"]'),
		).toBeVisible();
		await expect(page.locator("#code-lsp .eyebrow")).toHaveText("Oh My Pi LSP");
		await expect(page.locator("#custom-promptline .eyebrow")).toHaveText(
			"Neo editor",
		);
		await expect(page.locator("#mini-tetris .eyebrow")).toHaveText("Tetris");

		const shellWidths = await page.evaluate(() => {
			const nav = document
				.querySelector<HTMLElement>(".nav-inner")
				?.getBoundingClientRect();
			const featureNav = document
				.querySelector<HTMLElement>(".feature-nav-inner")
				?.getBoundingClientRect();
			if (!nav || !featureNav) return null;
			return { featureNavWidth: featureNav.width, navWidth: nav.width };
		});

		expect(shellWidths).not.toBeNull();
		expect(
			Math.abs(shellWidths!.navWidth - shellWidths!.featureNavWidth),
		).toBeLessThan(1);
	});

	test("keeps the desktop showcase compact with copy beside the terminal", async ({
		page,
	}) => {
		await page.goto("/");
		await page.locator("#features").scrollIntoViewIfNeeded();
		await page.evaluate(() => window.scrollBy(0, 420));

		const layout = await page.evaluate(() => {
			const story = document.querySelector<HTMLElement>(".feature-story-grid");
			const terminal = document.querySelector<HTMLElement>(
				".showcase-terminal-figure",
			);
			const copy = document.querySelector<HTMLElement>(".feature-story-copy");
			if (!story || !terminal || !copy) return null;
			const terminalBox = terminal.getBoundingClientRect();
			const copyBox = copy.getBoundingClientRect();
			return {
				storyHeightRatio: story.offsetHeight / window.innerHeight,
				terminalRight: terminalBox.right,
				copyLeft: copyBox.left,
				copyWidth: copyBox.width,
			};
		});

		expect(layout).not.toBeNull();
		expect(layout?.storyHeightRatio).toBeGreaterThan(1.2);
		expect(layout?.copyWidth).toBeGreaterThan(280);
		expect(layout!.copyLeft - layout!.terminalRight).toBeLessThan(120);
	});

	test("keeps the original cast while feature sections scroll", async ({
		page,
	}) => {
		await page.goto("/");
		await page.locator("#features").scrollIntoViewIfNeeded();
		await expect(page.locator(".showcase-terminal-player")).toHaveAttribute(
			"data-cast-src",
			"/recordings/demo.cast",
		);

		await page
			.locator("#custom-promptline")
			.evaluate((element) => element.scrollIntoView({ block: "center" }));
		await page.evaluate(() => window.scrollBy(0, 160));
		await expect(page.locator(".showcase-terminal-player")).toHaveAttribute(
			"data-cast-src",
			"/recordings/demo.cast",
		);
		await expect(page.locator("#custom-promptline")).toHaveClass(/opacity-100/);
	});

	test("uses a sticky terminal story beside the showcase copy", async ({
		page,
	}) => {
		await page.goto("/");
		await page.locator("#features").scrollIntoViewIfNeeded();

		const storyStyle = await page
			.locator(".feature-story-grid")
			.evaluate((element) => {
				const style = window.getComputedStyle(element);
				return { display: style.display, columns: style.gridTemplateColumns };
			});
		const terminalPosition = await page
			.locator(".showcase-terminal-figure")
			.evaluate((element) => window.getComputedStyle(element).position);

		expect(storyStyle.display).toBe("grid");
		expect(storyStyle.columns.split(" ").length).toBeGreaterThanOrEqual(2);
		expect(terminalPosition).toBe("sticky");
	});

	test("stacks the terminal story on small screens without static media cards", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/");

		const layout = await page
			.locator(".feature-story-grid")
			.evaluate((element) => {
				const style = window.getComputedStyle(element);
				return {
					columns: style.gridTemplateColumns,
					staticCards: document.querySelectorAll(
						"#features .feature-video-card",
					).length,
				};
			});

		expect(layout.columns.split(" ").length).toBe(1);
		expect(layout.staticCards).toBe(0);
	});
});
