/**
 * BOX CLI - init command
 * Scaffolds a new BOX project with recommended directory structure
 */

const fs = require('fs');
const path = require('path');

async function init(cwd) {
  console.log('\n📦 Initializing new BOX project...\n');

  // Create directory structure
  const dirs = [
    'src',
    'assets',
    'assets/images',
    'assets/fonts',
    '.vscode'
  ];

  for (const dir of dirs) {
    const dirPath = path.join(cwd, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`  📁 Created: ${dir}/`);
    }
  }

  // Create .vscode/settings.json for syntax highlighting
  const vscodeSettings = {
    "files.associations": {
      "*.box": "html"
    },
    "emmet.includeLanguages": {
      "box": "html"
    }
  };

  fs.writeFileSync(
    path.join(cwd, '.vscode', 'settings.json'),
    JSON.stringify(vscodeSettings, null, 2)
  );
  console.log('  ⚙️  Created: .vscode/settings.json');

  // Create main.box
  const mainBox = `<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .app-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
</style>

<template>
  <div class="app">
    <include src="./header.box" />
    
    <main class="app-content">
      <include src="./hero.box" />
    </main>
    
    <include src="./footer.box" />
  </div>
</template>

<script>
  console.log('📦 BOX App initialized!');
  
  // Set initial state
  Box.state.appName = 'My BOX App';
  Box.state.year = new Date().getFullYear();
</script>`;

  fs.writeFileSync(path.join(cwd, 'src', 'main.box'), mainBox);
  console.log('  📄 Created: src/main.box');

  // Create header.box
  const headerBox = `<style>
  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem 2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .header-nav {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .header-logo {
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
    text-decoration: none;
  }
  
  .header-links {
    display: flex;
    gap: 1.5rem;
  }
  
  .header-link {
    color: rgba(255,255,255,0.9);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }
  
  .header-link:hover {
    color: white;
  }
</style>

<template>
  <header class="header">
    <nav class="header-nav">
      <a href="/" class="header-logo" box-bind="appName">BOX App</a>
      <div class="header-links">
        <a href="/" class="header-link">Home</a>
        <a href="/about" class="header-link">About</a>
        <a href="/docs" class="header-link">Docs</a>
      </div>
    </nav>
  </header>
</template>

<script>
  console.log('Header component loaded');
</script>`;

  fs.writeFileSync(path.join(cwd, 'src', 'header.box'), headerBox);
  console.log('  📄 Created: src/header.box');

  // Create hero.box
  const heroBox = `<style>
  .hero {
    text-align: center;
    padding: 4rem 2rem;
  }
  
  .hero-title {
    font-size: 3rem;
    color: #1a1a2e;
    margin-bottom: 1rem;
  }
  
  .hero-subtitle {
    font-size: 1.25rem;
    color: #666;
    margin-bottom: 2rem;
  }
  
  .hero-cta {
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .hero-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  
  .hero-counter {
    margin-top: 3rem;
    padding: 2rem;
    background: #f8f9fa;
    border-radius: 12px;
  }
  
  .counter-value {
    font-size: 3rem;
    font-weight: bold;
    color: #667eea;
  }
  
  .counter-buttons {
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
  
  .counter-btn {
    padding: 0.5rem 1.5rem;
    font-size: 1.25rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .counter-btn-add {
    background: #667eea;
    color: white;
  }
  
  .counter-btn-sub {
    background: #e0e0e0;
    color: #333;
  }
</style>

<template>
  <section class="hero">
    <h1 class="hero-title">Welcome to BOX 📦</h1>
    <p class="hero-subtitle">A zero-dependency, full-stack framework for the modern web</p>
    <a href="/docs" class="hero-cta">Get Started →</a>
    
    <div class="hero-counter">
      <p>Reactive Counter Demo</p>
      <div class="counter-value" box-bind="counter">0</div>
      <div class="counter-buttons">
        <button class="counter-btn counter-btn-sub" onclick="Box.state.counter--">−</button>
        <button class="counter-btn counter-btn-add" onclick="Box.state.counter++">+</button>
      </div>
    </div>
  </section>
</template>

<script>
  // Initialize counter state
  Box.state.counter = 0;
  
  // Listen for counter updates
  Box.on('counter:update', (newValue, oldValue) => {
    console.log(\`Counter changed: \${oldValue} → \${newValue}\`);
  });
</script>`;

  fs.writeFileSync(path.join(cwd, 'src', 'hero.box'), heroBox);
  console.log('  📄 Created: src/hero.box');

  // Create footer.box
  const footerBox = `<style>
  .footer {
    background: #1a1a2e;
    color: rgba(255,255,255,0.7);
    padding: 2rem;
    text-align: center;
  }
  
  .footer-text {
    margin: 0;
  }
  
  .footer-heart {
    color: #e74c3c;
  }
</style>

<template>
  <footer class="footer">
    <p class="footer-text">
      Built with <span class="footer-heart">♥</span> using BOX Framework
      © <span box-bind="year">2024</span>
    </p>
  </footer>
</template>

<script>
  console.log('Footer component loaded');
</script>`;

  fs.writeFileSync(path.join(cwd, 'src', 'footer.box'), footerBox);
  console.log('  📄 Created: src/footer.box');

  // Create sample API endpoint
  const apiBox = `/* BOX_CONFIG: { "method": "GET", "auth": false } */

export default async (req, res, context) => {
  try {
    const greeting = {
      message: "Hello from BOX API!",
      timestamp: new Date().toISOString(),
      query: context.query
    };
    
    return { status: 200, data: greeting };
  } catch (err) {
    return { status: 500, error: "Server error" };
  }
};`;

  fs.writeFileSync(path.join(cwd, 'src', 'api+hello.box'), apiBox);
  console.log('  📄 Created: src/api+hello.box');

  // Create .gitignore
  const gitignore = `# Dependencies
node_modules/

# Build output
dist/

# IDE
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
`;

  fs.writeFileSync(path.join(cwd, '.gitignore'), gitignore);
  console.log('  📄 Created: .gitignore');

  // Create README.md
  const readme = `# 📦 BOX Project

A modern web application built with the BOX Framework.

## Getting Started

\`\`\`bash
# Start development server
box dev

# Build for production
box build

# Run production server
node dist/server.js
\`\`\`

## Project Structure

\`\`\`
├── src/
│   ├── main.box         # App entry point
│   ├── header.box       # Header component
│   ├── hero.box         # Hero section
│   ├── footer.box       # Footer component
│   └── api+hello.box    # Sample API endpoint
├── assets/              # Static files
└── dist/                # Build output
\`\`\`

## Commands

- \`box init\` - Initialize new project
- \`box dev\` - Start dev server with HMR
- \`box build\` - Build for production
- \`box add ui <name>\` - Create UI component
- \`box add api <name>\` - Create API endpoint

## Learn More

Visit the BOX documentation at [box-framework.dev](https://box-framework.dev)
`;

  fs.writeFileSync(path.join(cwd, 'README.md'), readme);
  console.log('  📄 Created: README.md');

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    📦 BOX Project Ready!                      ║
╚══════════════════════════════════════════════════════════════╝

  Next steps:

  1. Start development server:
     $ box dev

  2. Open http://localhost:3000 in your browser

  3. Edit src/*.box files and see live updates!

  Happy coding! 🚀
`);
}

module.exports = { init };
