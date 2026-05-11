function diffStylesheetRules(initial, current) {
  const changes = [];

  // Build lookup: ownerNode → sheet data
  const currentByNode = new Map();
  for (const sheet of current.sheets) {
    currentByNode.set(sheet.ownerNode, sheet);
  }

  for (const iniSheet of initial.sheets) {
    const curSheet = currentByNode.get(iniSheet.ownerNode);
    if (!curSheet) continue; // Sheet removed from DOM — skip

    // Group rules by selector (handles duplicate selectors within a sheet)
    const iniGroups = groupRulesByKey(iniSheet.rules);
    const curGroups = groupRulesByKey(curSheet.rules);

    // Find changed and added rules
    for (const [key, curRules] of curGroups) {
      const iniRules = iniGroups.get(key) || [];

      // Compare corresponding rules by position in the group
      const maxLen = Math.max(curRules.length, iniRules.length);
      for (let i = 0; i < maxLen; i++) {
        const ini = iniRules[i];
        const cur = curRules[i];

        if (!ini && cur) {
          // New rule
          changes.push({
            ruleSelector: formatRuleSelector(cur),
            sheet: curSheet.label,
            added: { ...cur.properties },
            changed: [],
            removed: [],
          });
        } else if (ini && !cur) {
          // Removed rule
          changes.push({
            ruleSelector: formatRuleSelector(ini),
            sheet: iniSheet.label,
            added: {},
            changed: [],
            removed: Object.keys(ini.properties),
          });
        } else if (ini && cur) {
          // Compare properties
          const added = {};
          const changed = [];
          const removed = [];

          for (const [prop, value] of Object.entries(cur.properties)) {
            if (!(prop in ini.properties)) {
              added[prop] = value;
            } else if (ini.properties[prop] !== value) {
              changed.push({ property: prop, from: ini.properties[prop], to: value });
            }
          }
          for (const prop of Object.keys(ini.properties)) {
            if (!(prop in cur.properties)) {
              removed.push(prop);
            }
          }

          if (Object.keys(added).length || changed.length || removed.length) {
            changes.push({
              ruleSelector: formatRuleSelector(cur),
              sheet: curSheet.label,
              added,
              changed,
              removed,
            });
          }
        }
      }
    }

    // Find selectors that existed initially but are completely gone now
    for (const [key, iniRules] of iniGroups) {
      if (!curGroups.has(key)) {
        for (const ini of iniRules) {
          changes.push({
            ruleSelector: formatRuleSelector(ini),
            sheet: iniSheet.label,
            added: {},
            changed: [],
            removed: Object.keys(ini.properties),
          });
        }
      }
    }
  }

  return changes;
}

function groupRulesByKey(rules) {
  const groups = new Map();
  for (const rule of rules) {
    // Include parentRule context in key so rules with the same selector but
    // different nesting (e.g., .card at top level vs .card inside @media) are
    // diffed independently rather than compared by position
    const key = (rule.parentRule || "") + "|||" + rule.selectorText;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(rule);
  }
  return groups;
}
