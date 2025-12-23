/**
 * BOX Minifier
 * Configurable CSS and JS minification for production builds
 * 
 * Minification levels:
 * - 'none'       - No minification (preserve formatting)
 * - 'basic'      - Remove comments and normalize whitespace
 * - 'aggressive' - Full minification with variable shortening
 */

class BoxMinifier {
  static level = 'basic'; // Default level

  /**
   * Set the minification level
   * @param {'none' | 'basic' | 'aggressive'} level
   */
  static setLevel(level) {
    if (!['none', 'basic', 'aggressive'].includes(level)) {
      console.warn(`⚠️  Unknown minification level: ${level}. Using 'basic'`);
      level = 'basic';
    }
    BoxMinifier.level = level;
  }

  /**
   * Minify CSS content
   */
  static minifyCSS(css) {
    if (BoxMinifier.level === 'none') {
      return css;
    }

    let result = css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove newlines and extra spaces
      .replace(/\s+/g, ' ')
      // Trim
      .trim();

    if (BoxMinifier.level === 'aggressive') {
      result = result
        // Remove spaces around special characters
        .replace(/\s*([{};:,>+~])\s*/g, '$1')
        // Remove trailing semicolons before closing braces
        .replace(/;}/g, '}')
        // Remove unnecessary zeros
        .replace(/(:|\s)0px/g, '$10')
        .replace(/(:|\s)0em/g, '$10')
        .replace(/(:|\s)0rem/g, '$10')
        // Shorten hex colors
        .replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3/g, '#$1$2$3');
    } else {
      // Basic level - just remove spaces around special chars
      result = result
        .replace(/\s*([{};:,>+~])\s*/g, '$1')
        .replace(/;}/g, '}');
    }

    return result;
  }

  /**
   * Minify JS content
   */
  static minifyJS(js) {
    if (BoxMinifier.level === 'none') {
      return js;
    }

    let result = js
      // Remove single-line comments (but not URLs)
      .replace(/(?<!:)\/\/.*$/gm, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Trim
      .trim();

    if (BoxMinifier.level === 'aggressive') {
      result = result
        // Normalize whitespace aggressively
        .replace(/\s+/g, ' ')
        // Remove spaces around operators
        .replace(/\s*([{};:,=+\-*/<>!&|?()\[\]])\s*/g, '$1')
        // Restore necessary spaces for keywords
        .replace(/(\breturn|\bvar|\blet|\bconst|\bfunction|\bif|\belse|\bfor|\bwhile|\bdo|\bswitch|\bcase|\btry|\bcatch|\bfinally|\bthrow|\bnew|\btypeof|\binstanceof|\bin|\bof)\b/g, ' $1 ')
        // Remove unnecessary semicolons
        .replace(/;}/g, '}')
        // Clean up extra spaces
        .replace(/\s+/g, ' ')
        .trim();
    } else {
      // Basic level - just normalize whitespace
      result = result
        .replace(/\s+/g, ' ')
        .replace(/\s*([{};])\s*/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return result;
  }

  /**
   * Minify HTML content
   */
  static minifyHTML(html) {
    if (BoxMinifier.level === 'none') {
      return html;
    }

    let result = html
      // Remove HTML comments (but not conditional comments)
      .replace(/<!--(?!\[)[\s\S]*?-->/g, '')
      // Trim
      .trim();

    if (BoxMinifier.level === 'aggressive') {
      result = result
        // Collapse all whitespace
        .replace(/\s+/g, ' ')
        // Remove spaces between tags
        .replace(/>\s+</g, '><')
        // Remove quotes from attributes where safe
        .replace(/="([^"'\s>]+)"/g, '=$1')
        .trim();
    } else {
      // Basic level - just normalize whitespace
      result = result
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
    }

    return result;
  }
}

module.exports = { BoxMinifier };
