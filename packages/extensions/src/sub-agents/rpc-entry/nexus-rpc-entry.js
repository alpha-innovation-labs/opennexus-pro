/**
 * Boots the current Nexus app in RPC mode using the local TypeScript sources.
 */
import jitiFactory from "jiti";

const jiti = jitiFactory(import.meta.url, { interopDefault: true });
const { runApp } = await jiti.import("../../../runtime/runApp.ts");
await runApp(process.argv.slice(2));
