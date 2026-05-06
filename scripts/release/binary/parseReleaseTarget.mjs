/**
 * Parses a Nexus release target string into platform fields.
 *
 * @param {string | undefined} target Release target such as linux-x64-gnu.
 * @returns {{ platform?: NodeJS.Platform, arch?: string, libc?: "gnu" | "musl", bunTarget?: string, npmOs?: string[], npmCpu?: string[] }} Parsed target fields.
 */
export function parseReleaseTarget(target) {
  if (!target) return {};
  if (target === "linux-x64-gnu") return { platform: "linux", arch: "x64", libc: "gnu", bunTarget: "bun-linux-x64", npmOs: ["linux"], npmCpu: ["x64"] };
  if (target === "linux-arm64-gnu") return { platform: "linux", arch: "arm64", libc: "gnu", bunTarget: "bun-linux-arm64", npmOs: ["linux"], npmCpu: ["arm64"] };
  if (target === "darwin-arm64") return { platform: "darwin", arch: "arm64", bunTarget: "bun-darwin-arm64", npmOs: ["darwin"], npmCpu: ["arm64"] };
  if (target === "darwin-x64") return { platform: "darwin", arch: "x64", bunTarget: "bun-darwin-x64", npmOs: ["darwin"], npmCpu: ["x64"] };
  throw new Error(`Unsupported Nexus release target: ${target}`);
}
