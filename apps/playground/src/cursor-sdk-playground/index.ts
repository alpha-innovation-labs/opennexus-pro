#!/usr/bin/env node
import { runPlayground } from "./runPlayground.js";

await runPlayground(process.argv.slice(2));
