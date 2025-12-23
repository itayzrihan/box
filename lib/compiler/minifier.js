/**
 * BOX Minifier
 * Simple CSS and JS minification for production builds
 */

class BoxMinifier {
  /**
   * Minify CSS content
   */
  static minifyCSS(css) {
    return css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove newlines and extra spaces
      .replace(/\s+/g, ' ')
      // Remove spaces around special characters
      .replace(/\s*([{};:,>+~])\s*/g, '$1')
      // Remove trailing semicolons before closing braces
      .replace(/;}/g, '}')
      // Trim
      .trim();
  }

  /**
   * Minify JS content (basic minification)
   * Note: For production, consider using a proper minifier like terser
   */
  static minifyJS(js) {
    return js
      // Remove single-line comments (but not URLs)
      .replace(/(?<!:)\/\/.*$/gm, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Remove spaces around operators (simplified)
      .replace(/\s*([{};:,=+\-*/<>!&|?])\s*/g, '$1')
      // Restore necessary spaces
      .replace(/(\breturn|\bvar|\blet|\bconst|\bfunction|\bif|\belse|\bfor|\bwhile|\bdo|\bswitch|\bcase|\btry|\bcatch|\bfinally|\bthrow|\bnew|\btypeof|\binstanceof|\bin|\bof)\b/g, ' $1 ')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      // Trim
      .trim();
  }

  /**
   * Minify HTML content
   */
  static minifyHTML(html) {
    return html
      // Remove HTML comments (but not conditional comments)
      .replace(/<!--(?!\[)[\s\S]*?-->/g, '')
      // Collapse whitespace
      .replace(/\s+/g, ' ')
      // Remove spaces between tags
      .replace(/>\s+</g, '><')
      // Trim
      .trim();
  }
}

module.exports = { BoxMinifier };
