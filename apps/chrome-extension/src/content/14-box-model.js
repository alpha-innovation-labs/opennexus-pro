// ─────────────────────────────────────────────────────────────────────
// DevTools Context Helpers (v0.3.0)
// ─────────────────────────────────────────────────────────────────────

/**
 * Get box model breakdown (content, padding, border, margin)
 * @param {Element} el - Target element
 * @returns {{ content: {width: number, height: number}, padding: {...}, border: {...}, margin: {...} }}
 */
function getBoxModel(el) {
  const style = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  
  const paddingH = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const paddingV = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const borderH = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
  const borderV = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
  
  return {
    content: {
      width: Math.max(0, Math.round(rect.width - paddingH - borderH)),
      height: Math.max(0, Math.round(rect.height - paddingV - borderV))
    },
    padding: {
      top: Math.round(parseFloat(style.paddingTop)),
      right: Math.round(parseFloat(style.paddingRight)),
      bottom: Math.round(parseFloat(style.paddingBottom)),
      left: Math.round(parseFloat(style.paddingLeft))
    },
    border: {
      top: Math.round(parseFloat(style.borderTopWidth)),
      right: Math.round(parseFloat(style.borderRightWidth)),
      bottom: Math.round(parseFloat(style.borderBottomWidth)),
      left: Math.round(parseFloat(style.borderLeftWidth))
    },
    margin: {
      top: Math.round(parseFloat(style.marginTop)),
      right: Math.round(parseFloat(style.marginRight)),
      bottom: Math.round(parseFloat(style.marginBottom)),
      left: Math.round(parseFloat(style.marginLeft))
    }
  };
}
