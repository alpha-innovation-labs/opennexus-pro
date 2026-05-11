(() => {
  const ROOT_ID = "nexus-annotation-agent-sidebar";
  const DAEMON_URL = "http://127.0.0.1:47321/annotation-conversation";
  const WIDTH = 380;
  let pollTimer = null;
  let lastEventCount = 0;
  let lastFinalCount = 0;

  /** Mounts sidebar stylesheet for dynamic injection paths. */
  function mountStyles() {
    if (document.getElementById("nexus-annotation-agent-sidebar-style")) return;
    const link = document.createElement("link");
    link.id = "nexus-annotation-agent-sidebar-style";
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("src/sidebar/sidebar.css");
    document.documentElement.appendChild(link);
  }

  /**
   * Creates the sidebar root when it is not already present.
   *
   * @returns {HTMLElement} Sidebar root element.
   */
  function ensureRoot() {
    let root = document.getElementById(ROOT_ID);
    if (root) return root;
    mountStyles();
    root = document.createElement("aside");
    root.id = ROOT_ID;
    root.innerHTML = `<div class="nexus-agent-head"><strong>Annotation agent</strong><button type="button" aria-label="Close annotation agent">×</button></div><div class="nexus-agent-status">Waiting for real Nexus chat…</div><div class="nexus-agent-events"></div><form class="nexus-agent-steer"><input type="text" placeholder="Steer the Nexus chat…" aria-label="Steer the Nexus chat" /><button type="submit">Send</button><button type="button" data-stop>Stop</button></form>`;
    document.body.appendChild(root);
    document.documentElement.style.setProperty("--nexus-annotation-sidebar-offset", `${WIDTH}px`);
    document.body.style.paddingRight = `${WIDTH}px`;
    root.querySelector(".nexus-agent-head button")?.addEventListener("click", stopSidebar);
    root.querySelector(".nexus-agent-steer")?.addEventListener("submit", (event) => {
      event.preventDefault();
      void sendSteeringMessage(root);
    });
    root.querySelector("[data-stop]")?.addEventListener("click", () => void stopConversation(root));
    return root;
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
   * Reads the active conversation id stored on the sidebar root.
   *
   * @param {HTMLElement} root Sidebar root.
   * @returns {string} Conversation id, or an empty string.
   */
  function readConversationId(root) {
    return root.dataset.conversationId || "";
  }

  /**
   * Sends a steering message to the active real Nexus chat.
   *
   * @param {HTMLElement} root Sidebar root.
   */
  async function sendSteeringMessage(root) {
    const conversationId = readConversationId(root);
    const input = root.querySelector(".nexus-agent-steer input");
    const message = input?.value?.trim() || "";
    if (!conversationId || !message) return;
    input.value = "";
    await fetch(`${DAEMON_URL}s/${encodeURIComponent(conversationId)}/steer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Stops the active real Nexus chat operation.
   *
   * @param {HTMLElement} root Sidebar root.
   */
  async function stopConversation(root) {
    const conversationId = readConversationId(root);
    if (!conversationId) return;
    await fetch(`${DAEMON_URL}s/${encodeURIComponent(conversationId)}/stop`, { method: "POST" });
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
      root.dataset.conversationId = "";
      status.textContent = "Waiting for real Nexus chat…";
      return;
    }
    root.dataset.conversationId = conversation.id || "";
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

  /** Starts polling the annotation daemon and showing the sidebar. */
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

  /** Stops sidebar polling and removes the sidebar from the page. */
  function stopSidebar() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
    lastEventCount = 0;
    lastFinalCount = 0;
    document.documentElement.style.removeProperty("--nexus-annotation-sidebar-offset");
    document.body.style.paddingRight = "";
    document.getElementById(ROOT_ID)?.remove();
  }

  /** Toggles the docked annotation agent sidebar. */
  function toggleSidebar() {
    if (document.getElementById(ROOT_ID)) stopSidebar();
    else showSidebar();
  }

  window.NexusAnnotationSidebar = { show: showSidebar, stop: stopSidebar, toggle: toggleSidebar };
})();
