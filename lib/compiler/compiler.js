/**
 * BOX Compiler
 * The main build engine that compiles .box files into production assets
 */

const fs = require('fs');
const path = require('path');
const { BoxParser } = require('./parser');
const { BoxScoper } = require('./scoper');

class BoxCompiler {
  constructor(srcDir, distDir) {
    this.srcDir = srcDir;
    this.distDir = distDir;
    this.compiledBoxes = new Map();
    this.apiRoutes = [];
    this.processedFiles = new Set();
  }

  /**
   * Main build method
   */
  async build() {
    console.log('📦 BOX Compiler starting...\n');

    // Ensure dist directory exists
    if (!fs.existsSync(this.distDir)) {
      fs.mkdirSync(this.distDir, { recursive: true });
    }

    // Start from main.box
    const mainBoxPath = path.join(this.srcDir, 'main.box');
    if (!fs.existsSync(mainBoxPath)) {
      throw new Error('main.box not found in src/ directory');
    }

    // Process the dependency tree
    console.log('🔍 Crawling dependencies...');
    await this.processBox(mainBoxPath);

    // Scan for API boxes
    console.log('🔌 Scanning API endpoints...');
    await this.scanApiBoxes();

    // Generate output files
    console.log('🔨 Generating output...');
    await this.generateOutput();

    console.log('\n✅ Build complete!');
    console.log(`   📁 Output: ${this.distDir}/`);
    console.log(`   📄 Files: index.html, style.css, app.js, server.js`);
    
    return {
      components: this.compiledBoxes.size,
      apiRoutes: this.apiRoutes.length
    };
  }

  /**
   * Process a single .box file and its dependencies
   */
  async processBox(filePath) {
    const absolutePath = path.resolve(filePath);
    
    if (this.processedFiles.has(absolutePath)) {
      return; // Already processed
    }

    this.processedFiles.add(absolutePath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`  ⚠️  File not found: ${filePath}`);
      return;
    }

    const filename = path.basename(filePath);
    const content = fs.readFileSync(absolutePath, 'utf-8');
    
    console.log(`  📄 Processing: ${filename}`);

    // Parse the box file
    const parsed = BoxParser.parse(content, filename);

    if (parsed.isApi) {
      // Handle API box separately
      return;
    }

    // Generate unique ID for this box
    const boxId = BoxScoper.generateId(filename);

    // Scope all parts
    const scoped = {
      id: boxId,
      filename,
      style: BoxScoper.scopeCSS(parsed.style, boxId),
      template: BoxScoper.scopeHTML(parsed.template, boxId),
      script: BoxScoper.scopeJS(parsed.script, boxId),
      includes: parsed.includes
    };

    // Store compiled box
    this.compiledBoxes.set(filename, scoped);

    // Process includes recursively
    for (const includePath of parsed.includes) {
      const resolvedPath = path.resolve(path.dirname(absolutePath), includePath);
      await this.processBox(resolvedPath);
    }
  }

  /**
   * Scan for API boxes in src directory
   */
  async scanApiBoxes() {
    const scanDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.name.startsWith('api+') && entry.name.endsWith('.box')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const parsed = BoxParser.parse(content, entry.name);
          const route = BoxParser.extractApiRoute(entry.name);
          
          // Transform the API code - extract the function body
          const transformedCode = this.transformApiCode(parsed.script);
          
          this.apiRoutes.push({
            filename: entry.name,
            path: route.path,
            method: parsed.config?.method || route.method,
            auth: parsed.config?.auth || false,
            code: transformedCode
          });
          
          console.log(`  🔌 API: ${route.method} ${route.path}`);
        }
      }
    };

    scanDir(this.srcDir);
  }

  /**
   * Transform API box code from ES module to function body
   */
  transformApiCode(code) {
    // Remove BOX_CONFIG comment
    let transformed = code.replace(/\/\*\s*BOX_CONFIG:[\s\S]*?\*\/\s*/g, '');
    
    // Extract the function body from export default async (req, res, context) => { ... }
    const arrowMatch = transformed.match(/export\s+default\s+async\s*\([^)]*\)\s*=>\s*\{([\s\S]*)\};?\s*$/);
    if (arrowMatch) {
      // Replace 'context' with 'ctx' to match our handler signature
      return arrowMatch[1].trim().replace(/\bcontext\b/g, 'ctx');
    }
    
    // Try regular function syntax: export default async function(req, res, context) { ... }
    const funcMatch = transformed.match(/export\s+default\s+async\s+function\s*\([^)]*\)\s*\{([\s\S]*)\};?\s*$/);
    if (funcMatch) {
      return funcMatch[1].trim().replace(/\bcontext\b/g, 'ctx');
    }
    
    // Fallback - return as-is but remove export default
    return transformed.replace(/export\s+default\s+/, '').trim().replace(/\bcontext\b/g, 'ctx');
  }

  /**
   * Generate all output files
   */
  async generateOutput() {
    // Generate index.html
    await this.generateHTML();
    
    // Generate style.css
    await this.generateCSS();
    
    // Generate app.js
    await this.generateJS();
    
    // Generate server.js
    await this.generateServer();

    // Copy assets if they exist
    await this.copyAssets();
  }

  /**
   * Generate index.html
   */
  async generateHTML() {
    // Collect all HTML templates in order
    let bodyContent = '';
    
    // Process main.box first, then resolve includes
    const mainBox = this.compiledBoxes.get('main.box');
    if (mainBox) {
      bodyContent = this.resolveIncludes(mainBox.template, mainBox.filename);
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BOX App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
${bodyContent}
  <script src="app.js"></script>
</body>
</html>`;

    fs.writeFileSync(path.join(this.distDir, 'index.html'), html);
  }

  /**
   * Resolve include placeholders with actual content
   */
  resolveIncludes(html, currentFile) {
    const includeRegex = /<!-- INCLUDE:([^>]+) -->/g;
    
    return html.replace(includeRegex, (match, includePath) => {
      const filename = path.basename(includePath);
      const box = this.compiledBoxes.get(filename);
      
      if (box) {
        // Recursively resolve nested includes
        return this.resolveIncludes(box.template, filename);
      }
      
      console.warn(`  ⚠️  Include not found: ${includePath} (referenced in ${currentFile})`);
      return `<!-- Missing: ${includePath} -->`;
    });
  }

  /**
   * Generate style.css
   */
  async generateCSS() {
    let css = `/* BOX Framework - Compiled Styles */\n\n`;
    css += `/* Reset & Base */\n`;
    css += `*, *::before, *::after { box-sizing: border-box; }\n`;
    css += `body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }\n\n`;

    for (const [filename, box] of this.compiledBoxes) {
      if (box.style) {
        css += `/* ${filename} */\n`;
        css += box.style;
        css += '\n\n';
      }
    }

    fs.writeFileSync(path.join(this.distDir, 'style.css'), css);
  }

  /**
   * Generate app.js with runtime
   */
  async generateJS() {
    // Include the Box Runtime first
    let js = this.getBoxRuntime();
    js += '\n\n/* === Compiled Components === */\n';

    for (const [filename, box] of this.compiledBoxes) {
      if (box.script) {
        js += `\n${box.script}\n`;
      }
    }

    fs.writeFileSync(path.join(this.distDir, 'app.js'), js);
  }

  /**
   * The Box Runtime - reactive state management
   */
  getBoxRuntime() {
    return `/**
 * BOX Runtime v1.0
 * Reactive state management for BOX Framework
 */
const Box = (function() {
  const listeners = {};
  
  const state = new Proxy({}, {
    set(target, key, value) {
      const oldValue = target[key];
      target[key] = value;
      
      // Update DOM elements with box-bind attribute
      document.querySelectorAll(\`[box-bind="\${key}"]\`).forEach(el => {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.value = value;
        } else if (el.tagName === 'SELECT') {
          el.value = value;
        } else {
          el.innerText = value;
        }
      });
      
      // Trigger event listeners
      if (listeners[\`\${key}:update\`]) {
        listeners[\`\${key}:update\`].forEach(fn => fn(value, oldValue));
      }
      
      return true;
    },
    
    get(target, key) {
      return target[key];
    }
  });
  
  // Event system
  function on(event, callback) {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      listeners[event] = listeners[event].filter(fn => fn !== callback);
    };
  }
  
  function emit(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(fn => fn(data));
    }
  }
  
  // API helper for fetching from Box API endpoints
  async function api(endpoint, options = {}) {
    const method = options.method || 'GET';
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    const config = {
      method,
      headers
    };
    
    if (options.body && method !== 'GET') {
      config.body = JSON.stringify(options.body);
    }
    
    try {
      const response = await fetch(\`/api/\${endpoint}\`, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Box API Error:', error);
      throw error;
    }
  }
  
  // Initialize box-bind inputs for two-way binding
  function initBindings() {
    document.querySelectorAll('[box-bind]').forEach(el => {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.addEventListener('input', (e) => {
          const key = el.getAttribute('box-bind');
          state[key] = e.target.value;
        });
      }
    });
  }
  
  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBindings);
  } else {
    initBindings();
  }
  
  return { state, on, emit, api };
})();`;
  }

  /**
   * Generate server.js for API endpoints
   */
  async generateServer() {
    const routes = this.apiRoutes.map(route => ({
      path: route.path,
      method: route.method,
      auth: route.auth,
      handler: route.filename
    }));

    const server = `/**
 * BOX Server - Auto-generated API Server
 * Run with: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// API Route Handlers
const apiHandlers = {
${this.apiRoutes.map(route => `  '${route.method}:${route.path}': async (req, res, ctx) => {
${this.indentCode(route.code, 4)}
  }`).join(',\n\n')}
};

// Parse JSON body
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Parse query parameters
function parseQuery(url) {
  const queryString = url.split('?')[1] || '';
  const params = new URLSearchParams(queryString);
  const query = {};
  for (const [key, value] of params) {
    query[key] = value;
  }
  return query;
}

// Main request handler
async function handleRequest(req, res) {
  const url = req.url.split('?')[0];
  const method = req.method;
  
  // API Routes
  if (url.startsWith('/api/')) {
    const routeKey = \`\${method}:\${url}\`;
    const handler = apiHandlers[routeKey];
    
    if (handler) {
      try {
        const body = await parseBody(req);
        const query = parseQuery(req.url);
        const context = {
          body,
          query,
          headers: req.headers,
          method
        };
        
        const result = await handler(req, res, context);
        
        res.writeHead(result.status || 200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result.data || result));
      } catch (error) {
        console.error('API Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
      return;
    }
  }
  
  // Static files
  let filePath = url === '/' ? '/index.html' : url;
  filePath = path.join(__dirname, filePath);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try index.html for SPA routing
      fs.readFile(path.join(__dirname, 'index.html'), (err2, indexData) => {
        if (err2) {
          res.writeHead(404);
          res.end('Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexData);
        }
      });
      return;
    }
    
    const ext = path.extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

// Start server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(\`
╔══════════════════════════════════════════════════════════════╗
║                    📦 BOX Server Running                      ║
╚══════════════════════════════════════════════════════════════╝

  🌐 Local:   http://localhost:\${PORT}
  📦 Mode:    Production
  
  API Routes:
${this.apiRoutes.map(r => `  ${r.method.padEnd(6)} ${r.path}`).join('\n') || '  (none)'}

  Press Ctrl+C to stop
\`);
});
`;

    fs.writeFileSync(path.join(this.distDir, 'server.js'), server);
  }

  /**
   * Indent code for embedding
   */
  indentCode(code, spaces) {
    const indent = ' '.repeat(spaces);
    return code.split('\n').map(line => indent + line).join('\n');
  }

  /**
   * Copy static assets to dist
   */
  async copyAssets() {
    const assetsDir = path.join(path.dirname(this.srcDir), 'assets');
    const distAssetsDir = path.join(this.distDir, 'assets');

    if (fs.existsSync(assetsDir)) {
      this.copyDirRecursive(assetsDir, distAssetsDir);
      console.log('  📂 Assets copied');
    }
  }

  /**
   * Recursively copy directory
   */
  copyDirRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

module.exports = { BoxCompiler };
