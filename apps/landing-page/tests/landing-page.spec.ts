import { expect, test } from "@playwright/test";

test.describe("Nexus landing page", () => {
	test("serves as a Next.js React app without legacy browser script assets", async ({
		page,
	}) => {
		await page.goto("/");

		const scriptSources = await page.evaluate(() => {
			return [
				...document.querySelectorAll<HTMLScriptElement>("script[src]"),
			].map((script) => script.src);
		});

		expect(
			scriptSources.some((source) => source.includes("/_next/static/")),
		).toBe(true);
		expect(scriptSources.some((source) => source.includes("/scripts/"))).toBe(
			false,
		);
	});

	test("renders the hero and resolves primary navigation targets", async ({
		page,
	}) => {
		await page.goto("/");

		await expect(
			page.getByRole("heading", { name: "For the love of TUIs" }),
		).toBeVisible();
		await expect(
			page.getByRole("tab", { name: "npm", exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("tab", { name: "bun", exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("tab", { name: "pnpm", exact: true }),
		).toBeVisible();
		await expect(page.getByText("npm install -g opennexus")).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Copy install command" }),
		).toBeVisible();

		await expect(page.locator("#features")).toHaveCount(1);
		await expect(page.locator(".showcase-terminal-player")).toHaveCount(1);

		const brokenTargets = await page.evaluate(() => {
			return [...document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
				.map((anchor) => anchor.hash.slice(1))
				.filter((id) => id.length > 0 && !document.getElementById(id));
		});

		expect(brokenTargets).toEqual([]);
	});

	test("switches between package manager install commands", async ({
		page,
	}) => {
		await page.goto("/");

		await page.getByRole("tab", { name: "bun", exact: true }).click();
		await expect(page.getByText("bun add -g opennexus")).toBeVisible();

		await page.getByRole("tab", { name: "pnpm", exact: true }).click();
		await expect(page.getByText("pnpm add -g opennexus")).toBeVisible();
	});

	test("uses square corners across page chrome", async ({ page }) => {
		await page.goto("/");
		await expect(
			page.locator(".showcase-terminal-player .ap-player"),
		).toBeVisible({ timeout: 10_000 });

		const curvedElements = await page.evaluate(() => {
			const cornerStyleSuffix = "ra" + "dius";
			const cornerStyles = [
				"top-left",
				"top-right",
				"bottom-right",
				"bottom-left",
			].map((corner) => `border-${corner}-${cornerStyleSuffix}`);

			return [...document.querySelectorAll("body *")].flatMap((element) => {
				const style = window.getComputedStyle(element);
				const cornerValues = cornerStyles.map((cornerStyle) =>
					style.getPropertyValue(cornerStyle),
				);
				const hasCurvedCorner = cornerValues.some(
					(cornerValue) => Number.parseFloat(cornerValue) > 0,
				);
				if (!hasCurvedCorner) return [];

				return [
					`${element.tagName.toLowerCase()} ${element.getAttribute("class") ?? ""}: ${cornerValues.join(",")}`,
				];
			});
		});

		expect(curvedElements).toEqual([]);
	});

	test("keeps the dark mode logo visible", async ({ page }) => {
		await page.goto("/");
		await page.evaluate(() => localStorage.setItem("nexus-theme", "dark"));
		await page.reload();

		const logoStyle = await page
			.locator(".brand-mark img")
			.evaluate((image) => {
				const style = window.getComputedStyle(image);
				return { filter: style.filter, opacity: style.opacity };
			});

		expect(logoStyle.opacity).toBe("1");
		expect(logoStyle.filter).not.toContain("brightness(0)");
	});
});
