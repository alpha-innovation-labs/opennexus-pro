Provides the async subagent widget that replaces the default loader with live run, queue, and completed-history lines.

## Features
- [[features/render/register-subagent-status-widget-extension|register-subagent-status-widget-extension]]: Hooks the working indicator and above-editor widget into session lifecycle events.

## File Structure
```text
src/
  extensions/
    sub-agent-status-widget/
      registerSubagentStatusWidgetExtension.ts
      runtime/
        clearSubagentStatusWidget.ts
        renderSubagentStatusWidget.ts
        subagentStatusWidgetIndicator.ts
        subagentStatusWidgetKey.ts
      ui/
        createSubagentStatusWidget.ts
        getWidgetToolSummary.ts
```
