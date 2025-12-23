/**
 * BOX Server
 * Pure Node.js HTTP server for serving BOX applications
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

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
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

class BoxServer {
  constructor(distDir, options = {}) {
    this.distDir = distDir;
    this.port = options.port || process.env.PORT || 3000;
    this.apiHandlers = options.apiHandlers || {};
  }

  /**
   * Register an API handler
   */
  registerApi(method, path, handler) {
    const key = `${method.toUpperCase()}:${path}`;
    this.apiHandlers[key] = handler;
  }

  /**
   * Start the server
   */
  start() {
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
    
    this.server.listen(this.port, () => {
      console.log(`📦 BOX Server running on http://localhost:${this.port}`);
    });

    return this.server;
  }

  /**
   * Stop the server
   */
  stop() {
    if (this.server) {
      this.server.close();
    }
  }

  /**
   * Handle incoming requests
   */
  async handleRequest(req, res) {
    const url = req.url.split('?')[0];
    const method = req.method;

    // CORS headers for API requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // API Routes
    if (url.startsWith('/api/')) {
      await this.handleApiRequest(req, res, url, method);
      return;
    }

    // Static files
    await this.handleStaticRequest(req, res, url);
  }

  /**
   * Handle API requests
   */
  async handleApiRequest(req, res, url, method) {
    const routeKey = `${method}:${url}`;
    const handler = this.apiHandlers[routeKey];

    if (!handler) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
      return;
    }

    try {
      const body = await this.parseBody(req);
      const query = this.parseQuery(req.url);
      
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
  }

  /**
   * Handle static file requests
   */
  async handleStaticRequest(req, res, url) {
    let filePath = url === '/' ? '/index.html' : url;
    filePath = path.join(this.distDir, filePath);

    // Security: prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(this.distDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // SPA fallback - serve index.html for unknown routes
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
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(data);
    });
  }

  /**
   * Parse JSON body from request
   */
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

  /**
   * Parse query parameters from URL
   */
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

module.exports = { BoxServer };
