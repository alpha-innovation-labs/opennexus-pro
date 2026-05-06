(() => {
  const ROOT_ID = "nexus-annotation-agent-sidebar";
  const STYLE_ID = "nexus-annotation-agent-sidebar-style";
  const DAEMON_URL = "http://127.0.0.1:47321/annotation-conversation";
  const WIDTH = 380;
  let pollTimer = null;
  let lastEventCount = 0;
  let lastFinalCount = 0;

  /**
   * Creates the sidebar root when it is not already present.
   *
   * @returns {HTMLElement} Sidebar root element.
   */
  function ensureRoot() {
    let root = document.getElementById(ROOT_ID);
    if (root) return root;

    root = document.createElement("aside");
    root.id = ROOT_ID;
    root.innerHTML = `
      <div class="nexus-agent-head">
        <strong>Annotation agent</strong>
        <button type="button" aria-label="Close annotation agent">×</button>
      </div>
      <div class="nexus-agent-status">Waiting for real Nexus chat…</div>
      <div class="nexus-agent-events"></div>
    `;
    mountStyles();
    document.body.appendChild(root);
    document.documentElement.style.setProperty("--nexus-annotation-sidebar-offset", `${WIDTH}px`);
    document.body.style.paddingRight = `${WIDTH}px`;
    root.querySelector("button")?.addEventListener("click", stopSidebar);
    return root;
  }

  /**
   * Mounts the stylesheet used by the docked annotation agent sidebar.
   */
  function mountStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID} { position: fixed; z-index: 2147483646; top: 0; right: 0; width: ${WIDTH}px; height: 100dvh; overflow: hidden; display: flex; flex-direction: column; border-left: 1px solid rgba(83,234,253,.28); background: #090d12; color: #f4f7fb; box-shadow: -18px 0 60px rgba(0,0,0,.42); font: 13px/1.45 Inter, ui-sans-serif, system-ui, sans-serif; }
      #${ROOT_ID} .nexus-agent-head { flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,.12); }
      #${ROOT_ID} button { border: 0; border-radius: 999px; width: 26px; height: 26px; background: rgba(255,255,255,.08); color: inherit; cursor: pointer; }
      #${ROOT_ID} .nexus-agent-status { flex: 0 0 auto; padding: 10px 14px; color: #98a2b3; border-bottom: 1px solid rgba(255,255,255,.08); overflow-wrap: anywhere; }
      #${ROOT_ID} .nexus-agent-events { flex: 1 1 auto; min-height: 0; display: grid; align-content: start; gap: 10px; overflow-y: auto; overflow-x: hidden; padding: 12px 12px 24px; overscroll-behavior: contain; }
      #${ROOT_ID} .nexus-agent-event { max-width: 100%; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; padding: 10px; background: rgba(255,255,255,.045); white-space: pre-wrap; overflow-wrap: anywhere; }
      #${ROOT_ID} .nexus-agent-kind { display: block; margin-bottom: 5px; color: #53eafd; font: 700 10px/1 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .14em; text-transform: uppercase; }
    `;
    document.documentElement.appendChild(style);
  }

  /**
   * Fetches the current page annotation conversation from the daemon.
   *
   * @returns {Promise<object|null>} Conversation payload.
   */
  async function fetchConversation() {
    const response = await fetch(`${DAEMON_URL}?url=${encodeURIComponent(location.href)}`);
    if (!response.ok) throw new Error(`daemon returned ${response.status}`);
    const body = await response.json();
    return body.conversation || null;
  }

  /**
   * Renders the latest real Nexus conversation state into the sidebar.
   *
   * @param {object|null} conversation Conversation returned by the daemon.
   */
  function renderConversation(conversation) {
    const root = ensureRoot();
    const status = root.querySelector(".nexus-agent-status");
    const events = root.querySelector(".nexus-agent-events");
    if (!status || !events) return;

    if (!conversation) {
      status.textContent = "Waiting for real Nexus chat…";
      return;
    }

    const count = Array.isArray(conversation.annotationIds) ? conversation.annotationIds.length : 0;
    status.textContent = `Conversation ${conversation.id.slice(0, 8)} · ${count} submission(s) · ${conversation.workspaceDir || "no workspace"}`;
    const nextEvents = Array.isArray(conversation.events) ? conversation.events : [];
    const resolvedEvents = nextEvents.filter((event) => event.kind === "resolved");
    if (resolvedEvents.length > lastFinalCount) {
      for (const event of resolvedEvents.slice(lastFinalCount)) {
        const annotationId = String(event.text || "").match(/[0-9a-f-]{36}/i)?.[0] || "";
        window.dispatchEvent(new CustomEvent("nexus-annotation-agent-resolved", { detail: { conversation, annotationId } }));
      }
    }
    lastFinalCount = resolvedEvents.length;
    if (nextEvents.length === lastEventCount) return;
    lastEventCount = nextEvents.length;
    events.replaceChildren(...nextEvents.map(renderEvent));
    events.scrollTop = events.scrollHeight;
  }

  /**
   * Renders one sidebar event row.
   *
   * @param {object} event Conversation event.
   * @returns {HTMLElement} Event element.
   */
  function renderEvent(event) {
    const item = document.createElement("article");
    item.className = "nexus-agent-event";
    const kind = document.createElement("span");
    kind.className = "nexus-agent-kind";
    kind.textContent = String(event.kind || "event");
    const text = document.createElement("div");
    text.textContent = String(event.text || "");
    item.append(kind, text);
    return item;
  }

  /**
   * Starts polling the annotation daemon and showing the sidebar.
   */
  function showSidebar() {
    ensureRoot();
    if (pollTimer) return;
    const poll = async () => {
      try { renderConversation(await fetchConversation()); }
      catch { renderConversation(null); }
    };
    void poll();
    pollTimer = setInterval(poll, 1000);
  }

  /**
   * Stops sidebar polling and removes the sidebar from the page.
   */
  function stopSidebar() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
    lastEventCount = 0;
    lastFinalCount = 0;
    document.documentElement.style.removeProperty("--nexus-annotation-sidebar-offset");
    document.body.style.paddingRight = "";
    document.getElementById(ROOT_ID)?.remove();
  }

  /**
   * Toggles the docked annotation agent sidebar.
   */
  function toggleSidebar() {
    if (document.getElementById(ROOT_ID)) stopSidebar();
    else showSidebar();
  }

  window.NexusAnnotationSidebar = { show: showSidebar, stop: stopSidebar, toggle: toggleSidebar };
})();
