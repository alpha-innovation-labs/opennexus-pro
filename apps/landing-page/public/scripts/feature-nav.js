/**
 * Shows only child navigation items that belong to the active major group.
 *
 * @param {string} groupId Active major group identifier.
 */
function showChildLinksForGroup(groupId) {
  document.querySelectorAll("[data-showcase-child-link]").forEach((link) => {
    link.hidden = link.getAttribute("data-showcase-parent") !== groupId;
  });
}

/**
 * Applies the active class to matching showcase navigation links.
 *
 * @param {string} attribute Navigation data attribute to query.
 * @param {string} id Active section identifier.
 */
function activateLinks(attribute, id) {
  document.querySelectorAll(`[${attribute}]`).forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute(attribute) === id);
  });
}

/**
 * Applies active major state and filters child links to that major group.
 *
 * @param {string} groupId Active major group identifier.
 */
function activateMajorGroup(groupId) {
  activateLinks("data-showcase-major-link", groupId);
  showChildLinksForGroup(groupId);
}

/**
 * Starts scroll-spy highlighting for major feature groups and child examples.
 */
function startFeatureNavScrollSpy() {
  const majorSections = document.querySelectorAll("[data-showcase-major]");
  const childSections = document.querySelectorAll("[data-showcase-child]");
  const observerOptions = { rootMargin: "-35% 0px -50% 0px", threshold: 0 };

  activateMajorGroup("core-plugins");
  activateLinks("data-showcase-child-link", "code-lsp");

  document.querySelectorAll("[data-showcase-major-link]").forEach((link) => {
    link.addEventListener("click", () => activateMajorGroup(link.getAttribute("data-showcase-major-link")));
  });

  const majorObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) activateMajorGroup(entry.target.getAttribute("data-showcase-major"));
    });
  }, observerOptions);

  const childObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) activateLinks("data-showcase-child-link", entry.target.getAttribute("data-showcase-child"));
    });
  }, observerOptions);

  majorSections.forEach((section) => majorObserver.observe(section));
  childSections.forEach((section) => childObserver.observe(section));
}

startFeatureNavScrollSpy();
