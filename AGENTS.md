`rd` is an alias to `just dev`
`just dev` runs the app directly, so `just dev <command>` for example, runs the app with the subcommand <command>

`packages/extension-core/` is a grouping folder, not a package. It contains standalone extension packages (each with its own `package.json` and `tsconfig.json`). The `tsconfig.json` here exists only as a structural signal for TypeScript tooling.
