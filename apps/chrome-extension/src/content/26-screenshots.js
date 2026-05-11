// ─────────────────────────────────────────────────────────────────────
// Screenshot Cropping
// ─────────────────────────────────────────────────────────────────────

async function cropToElement(dataUrl, element) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      
      const rect = element.getBoundingClientRect();
      
      let minX = Math.max(0, rect.left - SCREENSHOT_PADDING);
      let minY = Math.max(0, rect.top - SCREENSHOT_PADDING);
      let maxX = Math.min(window.innerWidth, rect.right + SCREENSHOT_PADDING);
      let maxY = Math.min(window.innerHeight, rect.bottom + SCREENSHOT_PADDING);
      
      const cropW = Math.max(1, (maxX - minX) * dpr);
      const cropH = Math.max(1, (maxY - minY) * dpr);
      
      if (maxX <= minX || maxY <= minY) {
        resolve(dataUrl);
        return;
      }
      
      const cropX = minX * dpr;
      const cropY = minY * dpr;
      
      const canvas = document.createElement("canvas");
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Add numbered badges to a full-page screenshot for selected elements
 * @param {string} dataUrl - Base64 screenshot data URL
 * @param {Array<{element: Element}>} elements - Selected elements with their DOM references
 * @returns {Promise<string>} Modified screenshot with badges
 */
async function addBadgesToScreenshot(dataUrl, elements) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      
      // Draw the original screenshot
      ctx.drawImage(img, 0, 0);
      
      // Badge styling (matches .pi-marker-badge)
      const badgeSize = 28 * dpr;
      const fontSize = 13 * dpr;
      const bgColor = "#8abeb7";     // --pi-accent (teal)
      const textColor = "#1d1f21";   // --pi-bg-body (dark)
      
      elements.forEach((sel, i) => {
        const element = sel.element;
        if (!element || !document.contains(element)) return;
        
        const rect = element.getBoundingClientRect();
        
        // Badge center should be at element's top-right corner (matching DOM badge positioning)
        // DOM: badge.style.left = rect.right - 14, badge.style.top = rect.top - 14
        // This puts the 28px badge's CENTER at (rect.right, rect.top)
        const centerX = rect.right * dpr;
        const centerY = rect.top * dpr;
        
        // Clamp to keep badge fully visible within canvas
        const badgeX = Math.max(badgeSize / 2, Math.min(centerX, canvas.width - badgeSize / 2));
        const badgeY = Math.max(badgeSize / 2, Math.min(centerY, canvas.height - badgeSize / 2));
        
        // Badge shadow (set before fill so it applies to the shape)
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 4 * dpr;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2 * dpr;
        
        // Badge background (circle)
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = bgColor;
        ctx.fill();
        
        // Reset shadow for text
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Badge number
        ctx.fillStyle = textColor;
        ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(i + 1), badgeX, badgeY);
      });
      
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
