if (shouldInitializeNexusAnnotate) {
window.addEventListener("nexus-annotation-agent-resolved", (event) => {
  const annotationId = event.detail?.annotationId;
  if (annotationId) markAnnotationResolved(annotationId);
});
restoreLauncherVisibility();
console.log("[pi-annotate] Content script ready (v0.4.0)");
}
