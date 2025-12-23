/**
 * BOX Parser
 * Extracts <style>, <template>, and <script> blocks from .box files
 */

class BoxParser {
  /**
   * Parse a .box file content and extract all sections
   * @param {string} content - The raw .box file content
   * @param {string} filename - The filename for error reporting
   * @returns {Object} Parsed sections
   */
  static parse(content, filename = 'unknown.box') {
    const result = {
      style: '',
      template: '',
      script: '',
      includes: [],
      config: null,
      isApi: filename.startsWith('api+') || filename.includes('/api+') || filename.includes('\\api+')
    };

    if (result.isApi) {
      return this.parseApiBox(content, filename);
    }

    return this.parseUiBox(content, filename);
  }

  /**
   * Parse a UI Box file
   */
  static parseUiBox(content, filename) {
    const result = {
      style: '',
      template: '',
      script: '',
      includes: [],
      config: null,
      isApi: false
    };

    // Extract <style> block
    const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/i);
    if (styleMatch) {
      result.style = styleMatch[1].trim();
    }

    // Extract <template> block
    const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/i);
    if (templateMatch) {
      result.template = templateMatch[1].trim();
    }

    // Extract <script> block
    const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/i);
    if (scriptMatch) {
      result.script = scriptMatch[1].trim();
    }

    // Extract <include> tags from template
    const includeRegex = /<include\s+src=["']([^"']+)["']\s*\/?>/gi;
    let includeMatch;
    while ((includeMatch = includeRegex.exec(result.template)) !== null) {
      result.includes.push(includeMatch[1]);
    }

    return result;
  }

  /**
   * Parse an API Box file
   */
  static parseApiBox(content, filename) {
    const result = {
      style: '',
      template: '',
      script: content,
      includes: [],
      config: null,
      isApi: true
    };

    // Extract BOX_CONFIG from comment
    const configMatch = content.match(/\/\*\s*BOX_CONFIG:\s*(\{[\s\S]*?\})\s*\*\//);
    if (configMatch) {
      try {
        result.config = JSON.parse(configMatch[1]);
      } catch (e) {
        console.warn(`Warning: Invalid BOX_CONFIG in ${filename}`);
      }
    }

    // Extract method from filename (api+get-users.box -> GET)
    const methodMatch = filename.match(/api\+(\w+)-/i);
    if (methodMatch && !result.config) {
      result.config = { method: methodMatch[1].toUpperCase() };
    }

    return result;
  }

  /**
   * Extract route name from API filename
   * api+users.box -> /api/users
   * api+get-users.box -> /api/users (GET)
   */
  static extractApiRoute(filename) {
    // Remove api+ prefix and .box extension
    let route = filename
      .replace(/^api\+/, '')
      .replace(/\.box$/, '');
    
    // Check for method prefix (get-, post-, put-, delete-)
    let method = 'GET';
    const methodPrefixes = ['get-', 'post-', 'put-', 'delete-', 'patch-'];
    for (const prefix of methodPrefixes) {
      if (route.toLowerCase().startsWith(prefix)) {
        method = prefix.replace('-', '').toUpperCase();
        route = route.slice(prefix.length);
        break;
      }
    }

    // Convert dashes to slashes for nested routes
    route = route.replace(/-/g, '/');

    return {
      path: `/api/${route}`,
      method
    };
  }
}

module.exports = { BoxParser };
