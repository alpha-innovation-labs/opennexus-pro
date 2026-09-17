# Compact tool call error

A failed tool call surfaces as one red error row inside the [[features/assistant-frame/assistant-activity-chain|assistant activity chain]]. The row reuses the normal tool chrome — the tool icon, the tool name, and the shared border rules — and shows the error text in the `error` color on the same line.

## Where the error flag lives

Pi reports a tool error on the render context, not on the result payload. The result object that reaches the renderer carries only its content and details; the error flag sits on the context alongside `expanded`, `isPartial`, and the tool call id. The wrapped tool definition copies the flag from the context onto the result entry it passes to the transcript renderer, because the transcript renderer reads the flag off the result.

## Call row versus result row

The wrapped tool renders two rows through the transcript renderer. The call row returns an empty container when the context reports an error, so no call row is drawn for a failed tool. The result row checks the flag on the result: when it is set, the row renders the failed tool call row. The failed row shows a top border only when it starts the frame and a bottom border only when it ends it, so it joins the chain at the correct junction.

Reading the flag off the result without injecting it is rejected and stays rejected: the result payload never carries it, so the check always reads undefined and the error row never renders.
