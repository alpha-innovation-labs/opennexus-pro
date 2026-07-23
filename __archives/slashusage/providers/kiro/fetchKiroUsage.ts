import { execFileSync } from "node:child_process";
import { clampPercent } from "../../shared/clampPercent.js";
import { formatResetTime } from "../../shared/formatResetTime.js";
import type { UsageSnapshot } from "../../types.js";

/**
 * Fetches Kiro usage through the Kiro CLI.
 *
 * @returns Kiro usage snapshot.
 */
export async function fetchKiroUsage(): Promise<UsageSnapshot> {
	try {
		execFileSync("kiro-cli", ["whoami"], { encoding: "utf-8", timeout: 5_000, stdio: ["ignore", "pipe", "pipe"] });
		const output = execFileSync("kiro-cli", ["chat", "--no-interactive", "/usage"], {
			encoding: "utf-8",
			timeout: 10_000,
			env: { ...process.env, TERM: "xterm-256color" },
			stdio: ["ignore", "pipe", "pipe"],
		}).replace(/\x1b\[[0-9;]*m/g, "");
		const percentFromBar = output.match(/█+\s*(\d+)%/);
		const percentFromCredits = output.match(/\((\d+\.?\d*)\s+of\s+(\d+)\s+covered/);
		const resetMatch = output.match(/resets on (\d{2}\/\d{2})/);
		const now = new Date();
		const resetAt = !resetMatch ? undefined : (() => {
			const [month, day] = resetMatch[1].split("/").map(Number);
			const date = new Date(now.getFullYear(), month - 1, day);
			if (date.getTime() < now.getTime()) date.setFullYear(date.getFullYear() + 1);
			return date.toISOString();
		})();
		const usedPercent = percentFromBar ? Number.parseInt(percentFromBar[1], 10) : percentFromCredits ? (Number.parseFloat(percentFromCredits[1]) / Math.max(1, Number.parseFloat(percentFromCredits[2]))) * 100 : 0;
		return {
			provider: "kiro",
			fetchedAt: Date.now(),
			windows: [{ label: "Credits", usedPercent: clampPercent(usedPercent), resetAt, resetDescription: resetAt ? formatResetTime(resetAt) : undefined }],
		};
	} catch (error) {
		return { provider: "kiro", windows: [], fetchedAt: Date.now(), error: error instanceof Error ? error.message : String(error) };
	}
}
