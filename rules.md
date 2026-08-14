Never make changes in node_modules
If a library in node_modules updated and broke our imports, find the correct import before rewriting the types in code base. Relevant to @earendil-works/* packages
// biome-ignore, // @ts-ignore, and other ignore for linting and typechecking are not allowed.
