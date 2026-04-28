import { resolve } from "node:path";
import { createStaticServer } from "./create-static-server.js";

const appRoot = resolve(import.meta.dirname, "../..");
const port = Number.parseInt(process.env.PORT ?? "4321", 10);
const server = createStaticServer({
  publicDir: resolve(appRoot, "public"),
  stylesDir: resolve(appRoot, "src/styles")
});

server.listen(port);
console.log(`Landing page server running at http://localhost:${port}`);
