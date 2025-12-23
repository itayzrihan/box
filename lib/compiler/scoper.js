/**
 * BOX Scoper
 * Handles CSS scoping and HTML attribute injection to prevent collisions
 */

const crypto = require('crypto');

class BoxScoper {
  /**
   * Generate a unique Box ID from filename
   * @param {string} filename - The .box filename
   * @returns {string} A unique 5-character hash prefixed with 'bx-'
   */
  static generateId(filename) {
    const hash = crypto
      .createHash('md5')
      .update(filename)
      .digest('hex')
      .substring(0, 5);
    return `bx-${hash}`;
  }

  /**
   * Scope CSS selectors with a data-box attribute
   * @param {string} css - The CSS content
   * @param {string} boxId - The unique box ID
   * @returns {string} Scoped CSS
   */
  static scopeCSS(css, boxId) {
    if (!css.trim()) return '';

    const scopedRules = [];
    
    // Split by } to get individual rules (simplified parser)
    const rules = this.parseCSS(css);
    
    for (const rule of rules) {
      if (!rule.selector || !rule.body) continue;
      
      // Handle multiple selectors (comma-separated)
      const selectors = rule.selector.split(',').map(s => s.trim());
      const scopedSelectors = selectors.map(selector => {
        // Skip @-rules like @keyframes, @media (handle nested separately)
        if (selector.startsWith('@')) {
          return selector;
        }
        // Scope the selector
        return `[data-box="${boxId}"] ${selector}`;
      });
      
      scopedRules.push(`${scopedSelectors.join(', ')} {${rule.body}}`);
    }

    return scopedRules.join('\n\n');
  }

  /**
   * Simple CSS parser to extract selector and body
   */
  static parseCSS(css) {
    const rules = [];
    let current = '';
    let braceCount = 0;
    let inRule = false;
    let selector = '';

    for (let i = 0; i < css.length; i++) {
      const char = css[i];
      
      if (char === '{') {
        if (braceCount === 0) {
          selector = current.trim();
          current = '';
          inRule = true;
        } else {
          current += char;
        }
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          rules.push({ selector, body: current.trim() });
          current = '';
          selector = '';
          inRule = false;
        } else {
          current += char;
        }
      } else {
        current += char;
      }
    }

    return rules;
  }

  /**
   * Wrap template HTML with a data-box attribute
   * @param {string} html - The HTML template content
   * @param {string} boxId - The unique box ID
   * @returns {string} Wrapped HTML
   */
  static scopeHTML(html, boxId) {
    if (!html.trim()) return '';
    
    // Convert <include> tags to placeholders first
    const processedHtml = html.replace(
      /<include\s+src=["']([^"']+)["']\s*\/?>/gi,
      (match, src) => `<!-- INCLUDE:${src} -->`
    );
    
    // Wrap in a div with data-box attribute
    return `<div data-box="${boxId}">\n${processedHtml}\n</div>`;
  }

  /**
   * Wrap script in an IIFE to isolate scope
   * @param {string} script - The JavaScript content
   * @param {string} boxId - The unique box ID
   * @returns {string} Scoped JavaScript
   */
  static scopeJS(script, boxId) {
    if (!script.trim()) return '';

    return `
/* Box: ${boxId} */
(function() {
  const __boxId = "${boxId}";
${script}
})();`;
  }

  /**
   * Process includes in HTML - replace <include> tags with placeholders
   * @param {string} html - The HTML content
   * @returns {Object} { html, includes }
   */
  static processIncludes(html) {
    const includes = [];
    const includeRegex = /<include\s+src=["']([^"']+)["']\s*\/?>/gi;
    
    let match;
    let processedHtml = html;
    
    while ((match = includeRegex.exec(html)) !== null) {
      includes.push(match[1]);
      processedHtml = processedHtml.replace(match[0], `<!-- INCLUDE:${match[1]} -->`);
    }

    return { html: processedHtml, includes };
  }
}

module.exports = { BoxScoper };
