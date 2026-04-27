import type { ElementSelection } from "../types.js";

/**
 * Formats a single selected element into markdown.
 *
 * @param element Selected element data.
 * @param index 0-based element index.
 * @returns Markdown block for one element.
 */
export function formatElementSelection(element: ElementSelection, index: number): string {
  let output = `${index + 1}. **${element.tag}**\n`;
  output += `   - Selector: \`${element.selector}\`\n`;

  if (element.id) {
    output += `   - ID: \`${element.id}\`\n`;
  }

  if (element.classes?.length) {
    output += `   - Classes: \`${element.classes.join(", ")}\`\n`;
  }

  if (element.text) {
    output += `   - Text: "${element.text}"\n`;
  }

  if (element.boxModel) {
    const boxModel = element.boxModel;
    const padding = `${boxModel.padding.top} ${boxModel.padding.right} ${boxModel.padding.bottom} ${boxModel.padding.left}`;
    const border = boxModel.border.top || boxModel.border.right || boxModel.border.bottom || boxModel.border.left
      ? `${boxModel.border.top} ${boxModel.border.right} ${boxModel.border.bottom} ${boxModel.border.left}`
      : "0";
    const margin = `${boxModel.margin.top} ${boxModel.margin.right} ${boxModel.margin.bottom} ${boxModel.margin.left}`;
    output += `   - **Box Model:** ${element.rect.width}×${element.rect.height} (content: ${boxModel.content.width}×${boxModel.content.height}, padding: ${padding}, border: ${border}, margin: ${margin})\n`;
  } else {
    output += `   - Size: ${element.rect.width}×${element.rect.height}px\n`;
  }

  if (element.attributes && Object.keys(element.attributes).length > 0) {
    const attributes = Object.entries(element.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(", ");
    output += `   - **Attributes:** ${attributes}\n`;
  }

  if (element.accessibility) {
    const accessibility = element.accessibility;
    const parts: string[] = [];
    if (accessibility.role) parts.push(`role=${accessibility.role}`);
    if (accessibility.name) parts.push(`name="${accessibility.name}"`);
    parts.push(`focusable=${accessibility.focusable}`);
    parts.push(`disabled=${accessibility.disabled}`);
    if (accessibility.expanded !== undefined) parts.push(`expanded=${accessibility.expanded}`);
    if (accessibility.pressed !== undefined) parts.push(`pressed=${accessibility.pressed}`);
    if (accessibility.checked !== undefined) parts.push(`checked=${accessibility.checked}`);
    if (accessibility.selected !== undefined) parts.push(`selected=${accessibility.selected}`);
    if (accessibility.description) parts.push(`description="${accessibility.description}"`);
    output += `   - **Accessibility:** ${parts.join(", ")}\n`;
  }

  const hasComputedStyles = Boolean(element.computedStyles && Object.keys(element.computedStyles).length > 0);
  if (!hasComputedStyles && element.keyStyles && Object.keys(element.keyStyles).length > 0) {
    const styles = Object.entries(element.keyStyles)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    output += `   - **Styles:** ${styles}\n`;
  }

  if (element.comment) {
    output += `   - **Comment:** ${element.comment}\n`;
  }

  if (element.computedStyles && Object.keys(element.computedStyles).length > 0) {
    output += "   - **Computed Styles:**\n";
    for (const [key, value] of Object.entries(element.computedStyles)) {
      output += `     - ${key}: ${value}\n`;
    }
  }

  if (element.parentContext) {
    const parentContext = element.parentContext;
    const label = parentContext.id
      ? `${parentContext.tag}#${parentContext.id}`
      : `${parentContext.tag}${parentContext.classes[0] ? `.${parentContext.classes[0]}` : ""}`;
    const styles = Object.entries(parentContext.styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    output += `   - **Parent Context:** ${label} (${styles})\n`;
  }

  if (element.cssVariables && Object.keys(element.cssVariables).length > 0) {
    output += "   - **CSS Variables:**\n";
    for (const [name, value] of Object.entries(element.cssVariables)) {
      output += `     - ${name}: ${value}\n`;
    }
  }

  return `${output}\n`;
}
