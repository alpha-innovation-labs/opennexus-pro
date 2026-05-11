/**
 * Discover all CSS variable names from stylesheets
 * @returns {Set<string>}
 */
function discoverCSSVariables() {
  if (cachedCSSVarNames) return cachedCSSVarNames;
  
  const varNames = new Set();
  
  function extractFromRules(rules) {
    if (!rules) return;
    for (const rule of rules) {
      if (rule.style) {
        for (const prop of rule.style) {
          if (prop.startsWith("--")) {
            varNames.add(prop);
          }
        }
      }
      if (rule.cssRules) {
        extractFromRules(rule.cssRules);
      }
    }
  }
  
  for (const sheet of document.styleSheets) {
    try {
      extractFromRules(sheet.cssRules);
    } catch (e) {
      // CORS blocks access - skip this sheet
    }
  }
  
  cachedCSSVarNames = varNames;
  return varNames;
}

/**
 * Get CSS variables used by element (debug mode only)
 * @param {Element} el - Target element
 * @returns {Record<string, string>}
 */
function getCSSVariables(el) {
  const style = window.getComputedStyle(el);
  const varNames = discoverCSSVariables();
  const variables = {};
  
  let count = 0;
  for (const name of varNames) {
    if (count >= 50) break;
    const value = style.getPropertyValue(name).trim();
    if (value) {
      variables[name] = value.length > 100 ? value.slice(0, 100) + "…" : value;
      count++;
    }
  }
  
  return variables;
}

/**
 * Reset CSS variable cache (call on deactivate)
 */
function resetCSSVarCache() {
  cachedCSSVarNames = null;
}
