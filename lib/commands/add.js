/**
 * BOX CLI - add command
 * Generates boilerplate .box files
 */

const fs = require('fs');
const path = require('path');

async function add(cwd, type, name) {
  const srcDir = path.join(cwd, 'src');
  
  // Ensure src directory exists
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  if (type === 'ui') {
    await addUiBox(srcDir, name);
  } else if (type === 'api') {
    await addApiBox(srcDir, name);
  } else if (type === 'page') {
    await addPageBox(srcDir, name);
  } else if (type === 'layout') {
    await addLayoutBox(srcDir, name);
  } else {
    throw new Error(`Unknown type: ${type}. Use 'ui', 'api', 'page', or 'layout'`);
  }
}

async function addUiBox(srcDir, name) {
  const filename = `${name}.box`;
  const filePath = path.join(srcDir, filename);

  if (fs.existsSync(filePath)) {
    throw new Error(`File already exists: ${filename}`);
  }

  const className = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const componentName = name.charAt(0).toUpperCase() + name.slice(1);

  const template = `<style>
  .${className} {
    /* Component styles */
  }
  
  .${className}-title {
    font-size: 1.5rem;
    color: #333;
  }
</style>

<template>
  <div class="${className}">
    <h2 class="${className}-title">${componentName} Component</h2>
    <p>Your content here...</p>
  </div>
</template>

<script>
  console.log('${componentName} component initialized');
  
  // Component logic here
  // Use Box.state.propertyName for reactive data
  // Use Box.on('event:name', callback) for event handling
</script>`;

  fs.writeFileSync(filePath, template);
  console.log(`\n✅ Created UI component: src/${filename}`);
  console.log(`\n   Add it to your app with:`);
  console.log(`   <include src="./${filename}" />\n`);
}

async function addApiBox(srcDir, name) {
  const filename = `api+${name}.box`;
  const filePath = path.join(srcDir, filename);

  if (fs.existsSync(filePath)) {
    throw new Error(`File already exists: ${filename}`);
  }

  const template = `/* BOX_CONFIG: { "method": "GET", "auth": false } */

export default async (req, res, context) => {
  try {
    // Access query params: context.query
    // Access request body: context.body
    // Access headers: context.headers
    
    const data = {
      message: "Hello from ${name} API",
      timestamp: new Date().toISOString()
    };
    
    return { status: 200, data };
  } catch (err) {
    console.error('API Error:', err);
    return { status: 500, error: "Internal server error" };
  }
};`;

  fs.writeFileSync(filePath, template);
  console.log(`\n✅ Created API endpoint: src/${filename}`);
  console.log(`\n   Route: GET /api/${name}`);
  console.log(`   Test it with: curl http://localhost:3000/api/${name}\n`);
}

/**
 * Add a page .box file (full-page with SEO meta tags)
 */
async function addPageBox(srcDir, name) {
  const filename = `${name}.box`;
  const filePath = path.join(srcDir, filename);
  
  if (fs.existsSync(filePath)) {
    throw new Error(`File already exists: src/${filename}`);
  }

  // Capitalize for display
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  const template = `<!--
  📄 ${displayName} Page
  A full-page component with SEO meta tags and routing support.
  
  Pages are top-level components that represent entire routes.
  They can include other UI components and connect to API endpoints.
-->

<!-- SEO Meta Tags - These will be injected into the <head> -->
<meta name="description" content="${displayName} - Your description here">
<meta name="keywords" content="${name}, page, box framework">
<meta property="og:title" content="${displayName}">
<meta property="og:description" content="${displayName} page description">

<style>
  .${name}-page {
    min-height: 100vh;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .${name}-header {
    margin-bottom: 2rem;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 1rem;
  }

  .${name}-header h1 {
    font-size: 2.5rem;
    color: #333;
    margin: 0;
  }

  .${name}-content {
    line-height: 1.6;
  }
</style>

<template>
  <div class="${name}-page">
    <header class="${name}-header">
      <h1>${displayName}</h1>
    </header>
    
    <main class="${name}-content">
      <p>Welcome to the ${displayName} page!</p>
      
      <!-- 
        💡 TIP: Include other components here
        <include src="my-component.box" />
      -->
      
      <!-- 
        💡 TIP: Add reactive state binding
        <p box-bind="message">Loading...</p>
      -->
    </main>
  </div>
</template>

<script>
  // 🧠 Page State - Reactive data for this page
  Box.state.pageTitle = "${displayName}";
  Box.state.isLoaded = true;
  
  // 📡 Lifecycle - Runs when page loads
  console.log("${displayName} page loaded!");
  
  // 💡 TIP: Fetch data from your API endpoints
  // const response = await fetch('/api/data');
  // const data = await response.json();
  // Box.state.myData = data;
</script>
`;

  fs.writeFileSync(filePath, template);
  console.log(`\n✅ Created page: src/${filename}`);
  console.log(`\n   This is a full-page component with:`);
  console.log(`   • SEO meta tags (edit for your content)`);
  console.log(`   • Responsive layout structure`);
  console.log(`   • Ready for component includes\n`);
}

/**
 * Add a layout .box file (wrapper for pages)
 */
async function addLayoutBox(srcDir, name) {
  const filename = `${name}.box`;
  const filePath = path.join(srcDir, filename);
  
  if (fs.existsSync(filePath)) {
    throw new Error(`File already exists: src/${filename}`);
  }

  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  const template = `<!--
  🎨 ${displayName} Layout
  A layout wrapper component that provides consistent structure.
  
  Layouts wrap pages and other components to provide:
  • Navigation headers
  • Sidebars
  • Footers
  • Common styling
-->

<style>
  .${name}-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .${name}-nav {
    background: #333;
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .${name}-nav a {
    color: white;
    text-decoration: none;
    margin-left: 1.5rem;
  }

  .${name}-nav a:hover {
    text-decoration: underline;
  }

  .${name}-main {
    flex: 1;
    padding: 2rem;
  }

  .${name}-footer {
    background: #f5f5f5;
    padding: 1rem 2rem;
    text-align: center;
    color: #666;
    border-top: 1px solid #e0e0e0;
  }
</style>

<template>
  <div class="${name}-layout">
    <!-- Navigation Header -->
    <nav class="${name}-nav">
      <div class="logo">
        <strong>My App</strong>
      </div>
      <div class="nav-links">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>
    </nav>
    
    <!-- Main Content Area -->
    <main class="${name}-main">
      <!-- 
        💡 TIP: Include your page content here
        <include src="home.box" />
        
        Or use this layout in your main.box:
        <include src="${name}.box" />
      -->
      <p>Layout content goes here</p>
    </main>
    
    <!-- Footer -->
    <footer class="${name}-footer">
      <p>&copy; 2024 My App. Built with BOX Framework.</p>
    </footer>
  </div>
</template>

<script>
  // 🧠 Layout State - Shared across wrapped pages
  Box.state.currentYear = new Date().getFullYear();
  Box.state.appName = "My App";
  
  console.log("${displayName} layout initialized");
</script>
`;

  fs.writeFileSync(filePath, template);
  console.log(`\n✅ Created layout: src/${filename}`);
  console.log(`\n   This is a layout wrapper with:`);
  console.log(`   • Navigation header`);
  console.log(`   • Main content area`);
  console.log(`   • Footer`);
  console.log(`\n   Use it by including in main.box:`);
  console.log(`   <include src="${name}.box" />\n`);
}

module.exports = { add };
