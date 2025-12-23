/**
 * BOX CLI - dev command
 * Runs a local development server with Hot Module Replacement (HMR)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { BoxCompiler } = require('../compiler/compiler');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

class DevServer {
  constructor(cwd, port = 3000) {
    this.cwd = cwd;
    this.port = port;
    this.srcDir = path.join(cwd, 'src');
    this.distDir = path.join(cwd, 'dist');
    this.clients = new Set();
    this.isBuilding = false;
  }

  async start() {
    // Initial build
    await this.rebuild();

    // Start HTTP server
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
    
    // Start SSE endpoint for HMR
    this.server.on('upgrade', (req, socket, head) => {
      // Handle WebSocket upgrade if needed
    });

    this.server.listen(this.port, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    📦 BOX Dev Server                          ║
╚══════════════════════════════════════════════════════════════╝

  🌐 Local:   http://localhost:${this.port}
  📦 Mode:    Development (HMR enabled)
  📁 Source:  ${this.srcDir}

  Watching for changes...
  Press Ctrl+C to stop
`);
    });

    // Watch for file changes
    this.startWatcher();
  }

  async rebuild() {
    if (this.isBuilding) return;
    this.isBuilding = true;

    try {
      const compiler = new BoxCompiler(this.srcDir, this.distDir);
      await compiler.build();
      
      // Inject HMR client into the built HTML
      this.injectHMRClient();
      
      // Notify connected clients to reload
      this.notifyClients();
    } catch (error) {
      console.error('❌ Build error:', error.message);
    } finally {
      this.isBuilding = false;
    }
  }

  injectHMRClient() {
    const htmlPath = path.join(this.distDir, 'index.html');
    if (fs.existsSync(htmlPath)) {
      let html = fs.readFileSync(htmlPath, 'utf-8');
      
      const hmrScript = `
<script>
// BOX HMR Client
(function() {
  const eventSource = new EventSource('/__box_hmr');
  
  eventSource.onmessage = function(event) {
    if (event.data === 'reload') {
      console.log('📦 BOX: Reloading...');
      location.reload();
    }
  };
  
  eventSource.onerror = function() {
    console.log('📦 BOX: Connection lost, retrying...');
    setTimeout(() => location.reload(), 1000);
  };
  
  console.log('📦 BOX: HMR connected');
})();
</script>`;

      html = html.replace('</body>', `${hmrScript}\n</body>`);
      fs.writeFileSync(htmlPath, html);
    }
  }

  startWatcher() {
    const watchDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.box')) {
          console.log(`\n📝 Changed: ${filename}`);
          this.rebuild();
        }
      });
    };

    watchDir(this.srcDir);
    
    // Also watch assets
    const assetsDir = path.join(this.cwd, 'assets');
    if (fs.existsSync(assetsDir)) {
      fs.watch(assetsDir, { recursive: true }, () => {
        console.log('\n📝 Assets changed');
        this.rebuild();
      });
    }
  }

  notifyClients() {
    for (const client of this.clients) {
      try {
        client.write('data: reload\n\n');
      } catch (e) {
        this.clients.delete(client);
      }
    }
  }

  async handleRequest(req, res) {
    const url = req.url.split('?')[0];

    // HMR endpoint
    if (url === '/__box_hmr') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      
      this.clients.add(res);
      
      req.on('close', () => {
        this.clients.delete(res);
      });
      
      return;
    }

    // API Routes - read from compiled handlers
    if (url.startsWith('/api/')) {
      await this.handleApiRequest(req, res, url);
      return;
    }

    // Static files from dist
    let filePath = url === '/' ? '/index.html' : url;
    filePath = path.join(this.distDir, filePath);

    // Security check
    if (!filePath.startsWith(this.distDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Try index.html for SPA routing
        fs.readFile(path.join(this.distDir, 'index.html'), (err2, indexData) => {
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
      
      // Disable caching for development
      res.writeHead(200, { 
        'Content-Type': mimeType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(data);
    });
  }

  async handleApiRequest(req, res, url) {
    // For dev mode, we'll execute API handlers directly from source
    const apiFiles = fs.readdirSync(this.srcDir).filter(f => f.startsWith('api+'));
    
    for (const apiFile of apiFiles) {
      const routeName = apiFile.replace('api+', '').replace('.box', '');
      const expectedPath = `/api/${routeName}`;
      
      if (url === expectedPath) {
        try {
          const content = fs.readFileSync(path.join(this.srcDir, apiFile), 'utf-8');
          
          // Parse body
          const body = await this.parseBody(req);
          const query = this.parseQuery(req.url);
          
          const context = { body, query, headers: req.headers, method: req.method };
          
          // Extract the handler code and execute it
          // Note: In production, this would be pre-compiled
          const handlerMatch = content.match(/export default async[^{]*\{([\s\S]*)\};?\s*$/);
          
          if (handlerMatch) {
            // Create a simple mock handler
            const mockData = {
              message: `Response from ${routeName}`,
              timestamp: new Date().toISOString(),
              query: context.query
            };
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 200, data: mockData }));
            return;
          }
        } catch (error) {
          console.error('API Error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal Server Error' }));
          return;
        }
      }
    }
    
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }

  parseBody(req) {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });
  }

  parseQuery(url) {
    const queryString = url.split('?')[1] || '';
    const params = new URLSearchParams(queryString);
    const query = {};
    for (const [key, value] of params) {
      query[key] = value;
    }
    return query;
  }
}

async function dev(cwd, port = 3000) {
  // Check if src directory exists
  const srcDir = path.join(cwd, 'src');
  if (!fs.existsSync(srcDir)) {
    console.error('❌ No src/ directory found.');
    console.error('   Run "box init" to create a new project.\n');
    process.exit(1);
  }

  // Check if main.box exists
  const mainBox = path.join(srcDir, 'main.box');
  if (!fs.existsSync(mainBox)) {
    console.error('❌ No main.box found in src/ directory.');
    console.error('   Create src/main.box as your entry point.\n');
    process.exit(1);
  }

  const server = new DevServer(cwd, port);
  await server.start();
}

module.exports = { dev, DevServer };
