function serializeAllStylesheets() {
  const sheets = [];
  let crossOriginCount = 0;

  for (let si = 0; si < document.styleSheets.length; si++) {
    const sheet = document.styleSheets[si];
    // Skip pi-annotate's own injected styles
    if (sheet.ownerNode?.id === "pi-styles") continue;

    try {
      const rules = sheet.cssRules;
      const sheetLabel = sheet.href || `inline stylesheet`;

      // Individual top-level rule strings for undo/redo (each passed directly to insertRule)
      const ruleTexts = [];
      for (let i = 0; i < rules.length; i++) {
        ruleTexts.push(rules[i].cssText);
      }

      // Per-rule breakdown for diffing (recurses into @media, @supports, etc.)
      const ruleData = [];
      serializeRulesRecursive(rules, ruleData);

      sheets.push({
        ownerNode: sheet.ownerNode,   // stable reference for matching
        label: sheetLabel,            // display label for diff output
        ruleTexts,                    // for undo/redo restoration
        rules: ruleData,              // for property-level diffing
      });
    } catch (e) {
      crossOriginCount++;
    }
  }

  return { sheets, crossOriginCount };
}

function serializeRulesRecursive(rules, output) {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (rule.style && rule.selectorText) {
      // CSSStyleRule (or similar with a selector and style declaration)
      output.push({
        selectorText: rule.selectorText,
        properties: serializeRuleProperties(rule.style),
        // Walk up the full parentRule chain for nested context
        // e.g., "@layer base > @media (max-width: 768px)" for doubly-nested rules
        parentRule: getParentRuleContext(rule),
      });
    }
    // Recurse into grouping rules (@media, @supports, @layer, etc.)
    if (rule.cssRules) {
      serializeRulesRecursive(rule.cssRules, output);
    }
  }
}

function getParentRuleContext(rule) {
  const parts = [];
  let parent = rule.parentRule;
  while (parent) {
    // Extract the at-rule prefix (everything before the first "{")
    if (parent.cssText) {
      parts.unshift(parent.cssText.split("{")[0].trim());
    }
    parent = parent.parentRule;
  }
  return parts.length > 0 ? parts.join(" > ") : null;
}

function serializeRuleProperties(style) {
  const props = {};
  for (let i = 0; i < style.length; i++) {
    const prop = style[i];
    props[prop] = style.getPropertyValue(prop);
  }
  return props;
}
