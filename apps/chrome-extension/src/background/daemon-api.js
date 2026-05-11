/**
 * Checks whether the local annotations daemon is reachable.
 *
 * @returns {Promise<{ ok: boolean, error?: string }>} Daemon health result.
 */
export async function checkAnnotationDaemonStatus() {
  try {
    const response = await fetch("http://127.0.0.1:47321/health");
    return response.ok ? { ok: true } : { ok: false, error: `Daemon returned ${response.status}` };
  } catch (err) {
    return { ok: false, error: err?.message || "Annotation daemon unreachable" };
  }
}

/**
 * Stores completed annotations directly when native messaging is unavailable.
 *
 * @param {object} msg Content-script completion payload.
 * @returns {Promise<object|null>} Stored annotation response.
 */
export async function storeAnnotationDirectly(msg) {
  if (msg?.type !== "ANNOTATIONS_COMPLETE" || !msg.result?.success) return null;
  try {
    const response = await fetch("http://127.0.0.1:47321/annotations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(msg.result),
    });
    if (!response.ok) console.error("[pi-annotate] Annotation daemon rejected capture:", response.status);
    return await response.json().catch(() => null);
  } catch (err) {
    console.error("[pi-annotate] Annotation daemon capture failed:", err?.message || err);
    return null;
  }
}
