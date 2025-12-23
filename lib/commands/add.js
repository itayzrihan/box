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
  } else {
    throw new Error(`Unknown type: ${type}. Use 'ui' or 'api'`);
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

module.exports = { add };
