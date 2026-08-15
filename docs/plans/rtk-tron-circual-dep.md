 ### The current situation

 pi-coding-agent (the core library) registers the 7 built-in tools during core extension loading. Nexus extensions
 then override them by re-registering with the same name:

 1. pi-coding-agent registers read (base implementation)
 2. RTK extension registers read (RTK wrapper — gets overridden)
 3. Tron extension registers read (compact wrapper — wins)

 The last registration wins because registerTool does tools.set(tool.name, ...).

 ### The clean design: RTK overrides, tron just renders

 Step 1: RTK extension registers its tools (bash, read, find, grep, ls) — these override the base tools with
 RTK-aware implementations. Tron does NOT re-register these tools.

 Step 2: Tron's proxy wraps every registerTool call with compact rendering. But tron also manually registers the 7
 built-in tools to apply compact rendering + RTK delegation. Remove the manual registration.

 Step 3: The proxy's createCompactToolDefinition already handles rendering for all tools — it just needs to not
 clobber RTK's tools.

 The trick is: when the proxy wraps a tool, it replaces the execute method with its own compact rendering logic. But
 it doesn't touch execute — it only adds renderCall and renderResult. So the existing execute (from RTK) would still
 be called.

 Wait — let me re-read the proxy:

 ```typescript
   const compactDefinition = isCompactWrappedToolDefinition(definition)
       ? definition
       : createCompactToolDefinition(definition);
 ```

 createCompactToolDefinition does { ...definition, renderCall(...), renderResult(...) } — it spreads the original
 definition, preserving execute. So the proxy already preserves RTK's execute method!

 The problem is that tron's manual registerCompactBuiltInTool re-registers the tools after the proxy has already
 wrapped them, and tron's manual registration replaces execute with a delegation layer that calls
 getBuiltInTools(getRtkExecutionCwd(ctx))[toolName].execute(...).

 ### The fix

 Remove tron's manual registerCompactBuiltInTool calls entirely. Just let the proxy handle compact rendering for all
 tools (both RTK's and extension tools). The proxy's createCompactToolDefinition spreads the original definition, so
 RTK's execute is preserved.

 The only thing tron currently adds manually is the RTK delegation in execute(). But RTK's own tools already have
 that delegation built in (they check getRtkRuntimeForCwd() and delegate to the base tool). So tron's delegation
 layer is redundant.

 ### What changes

 - Remove registerCompactBuiltInTool calls from registerCompactToolLinesExtension
 - Remove the 7 registerCompactBuiltInTool(pi, "read") etc. lines
 - Remove RTK's dead registerTool() calls (they're now unnecessary since the proxy handles rendering)
 - RTK only needs its session_start handler (sets up runtime) and tool_call handler (bash rewrite)

 Tron becomes a pure rendering layer. RTK becomes a pure execution layer. They don't cross-reference each other.
