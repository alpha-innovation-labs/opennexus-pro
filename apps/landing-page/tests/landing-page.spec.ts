import { expect, test } from "@playwright/test";

test.describe("Nexus landing page", () => {
  test("serves as a Next.js React app without legacy browser script assets", async ({ page }) => {
    await page.goto("/");

    const scriptSources = await page.evaluate(() => {
      return [...document.querySelectorAll<HTMLScriptElement>("script[src]")].map((script) => script.src);
    });

    expect(scriptSources.some((source) => source.includes("/_next/static/"))).toBe(true);
    expect(scriptSources.some((source) => source.includes("/scripts/"))).toBe(false);
  });

  test("renders the hero and resolves primary navigation targets", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "For the love of TUIs" })).toBeVisible();
    await expect(page.getByText("npm install -g opennexus")).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy install command" })).toBeVisible();

    await expect(page.locator("#demo")).toHaveCount(1);
    await expect(page.locator("#features")).toHaveCount(1);

    const brokenTargets = await page.evaluate(() => {
      return [...document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
        .map((anchor) => anchor.hash.slice(1))
        .filter((id) => id.length > 0 && !document.getElementById(id));
    });

    expect(brokenTargets).toEqual([]);
  });

  test("mounts one cast player without duplicate ids", async ({ page }) => {
    await page.goto("/");
    await page.locator("#demo").scrollIntoViewIfNeeded();

    await expect(page.locator(".nexus-cast-player")).toHaveCount(1);
    await expect(page.locator(".cast-terminal-frame")).toBeVisible();
    await expect(page.locator(".ap-player")).toBeVisible({ timeout: 10_000 });

    const duplicateIds = await page.evaluate(() => {
      const ids = [...document.querySelectorAll<HTMLElement>("[id]")].map((element) => element.id);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });

    expect(duplicateIds).toEqual([]);
  });

  test("keeps demo copy and terminal visible together while scrolling", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      const demo = document.getElementById("demo");
      window.scrollTo(0, (demo?.offsetTop ?? 0) + 650);
    });
    await page.waitForTimeout(250);

    const terminalBox = await page.locator(".cast-terminal-frame").boundingBox();
    const copyBox = await page.getByRole("heading", { name: "Watch Nexus stay in flow." }).boundingBox();

    expect(terminalBox).not.toBeNull();
    expect(copyBox).not.toBeNull();
    expect(terminalBox!.width).toBeGreaterThan(300);
    expect(copyBox!.width).toBeGreaterThan(200);
    expect(Math.abs((terminalBox!.y + terminalBox!.height / 2) - (copyBox!.y + copyBox!.height / 2))).toBeLessThan(360);
  });

  test("renders the wired feature showcase navigation", async ({ page }) => {
    await page.goto("/");
    await page.locator("#features").scrollIntoViewIfNeeded();

    await expect(page.getByRole("navigation", { name: "Feature showcase navigation" })).toBeVisible();
    await expect(page.locator('[data-showcase-major-link="core-plugins"]')).toBeVisible();
    await expect(page.locator('[data-showcase-major-link="custom-plugins"]')).toBeVisible();
    await expect(page.locator('[data-showcase-major-link="mini-apps"]')).toBeVisible();
    await expect(page.locator("#code-lsp .eyebrow")).toHaveText("Oh My Pi LSP");
    await expect(page.locator("#custom-promptline .eyebrow")).toHaveText("Neo editor");
    await expect(page.locator("#mini-tetris .eyebrow")).toHaveText("Tetris");
  });

  test("keeps the desktop demo compact with copy beside the terminal", async ({ page }) => {
    await page.goto("/");

    const layout = await page.evaluate(() => {
      const demo = document.querySelector<HTMLElement>("#demo");
      const terminal = document.querySelector<HTMLElement>(".cast-terminal-frame");
      const copy = document.querySelector<HTMLElement>(".cast-demo-scroll-copy");
      if (!demo || !terminal || !copy) return null;
      const terminalBox = terminal.getBoundingClientRect();
      const copyBox = copy.getBoundingClientRect();
      return {
        demoHeightRatio: demo.offsetHeight / window.innerHeight,
        terminalRight: terminalBox.right,
        copyLeft: copyBox.left,
        copyWidth: copyBox.width,
      };
    });

    expect(layout).not.toBeNull();
    expect(layout!.demoHeightRatio).toBeLessThan(2.8);
    expect(layout!.copyWidth).toBeGreaterThan(280);
    expect(layout!.copyLeft - layout!.terminalRight).toBeLessThan(120);
  });

  test("keeps the dark mode logo visible", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("nexus-theme", "dark"));
    await page.reload();

    const logoStyle = await page.locator(".brand-mark img").evaluate((image) => {
      const style = window.getComputedStyle(image);
      return { filter: style.filter, opacity: style.opacity };
    });

    expect(logoStyle.opacity).toBe("1");
    expect(logoStyle.filter).not.toContain("brightness(0)");
  });

  test("uses a two-column desktop showcase instead of plain stacked blocks", async ({ page }) => {
    await page.goto("/");
    await page.locator("#features").scrollIntoViewIfNeeded();

    const showcaseStyle = await page.locator(".showcase-example").first().evaluate((element) => {
      const style = window.getComputedStyle(element);
      return { display: style.display, columns: style.gridTemplateColumns };
    });

    expect(showcaseStyle.display).toBe("grid");
    expect(showcaseStyle.columns.split(" ").length).toBeGreaterThanOrEqual(2);
  });

  test("hides nonessential repeated feature media on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const visibleFeatureMediaCount = await page.evaluate(() => {
      return [...document.querySelectorAll<HTMLElement>("#features .feature-video-card")].filter((element) => {
        const style = window.getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return style.display !== "none" && box.width > 0 && box.height > 0;
      }).length;
    });

    expect(visibleFeatureMediaCount).toBe(0);
  });
});
