#!/usr/bin/env node

/**
 * create-box-app
 * Scaffolding CLI for BOX Framework
 * Usage: npx create-box-app my-project
 */

const fs = require('fs');
const path = require('path');

const projectName = process.argv[2] || 'my-box-app';
const targetDir = path.join(process.cwd(), projectName);
const templateDir = path.join(__dirname, '..', 'template');

async function init() {
  console.log(`\n╔══════════════════════════════════════════════════════════════╗
║                   📦 BOX Framework Setup                      ║
╚══════════════════════════════════════════════════════════════╝\n`);

  console.log(`📁 Creating your BOX project: ${projectName}\n`);

  // Check if folder already exists
  if (fs.existsSync(targetDir)) {
    console.error(`❌ Folder already exists: ${projectName}`);
    process.exit(1);
  }

  try {
    // Create directory
    fs.mkdirSync(targetDir, { recursive: true });

    // Copy template directory recursively
    copyDir(templateDir, targetDir);

    // Customize package.json
    const pkgPath = path.join(targetDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    pkg.name = projectName;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

    console.log(`✅ Project created successfully!\n`);
    console.log(`📋 Next steps:\n`);
    console.log(`   1. Navigate to your project:`);
    console.log(`      cd ${projectName}\n`);
    console.log(`   2. Install dependencies:`);
    console.log(`      npm install\n`);
    console.log(`   3. Start the dev server:`);
    console.log(`      npm run dev\n`);
    console.log(`   4. Open in VS Code:`);
    console.log(`      code .\n`);
    console.log(`📚 Learn more: https://github.com/itayzrihan/box\n`);
    console.log(`Happy BOXing! 🚀\n`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Recursively copy directory
 */
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);

  files.forEach(file => {
    const srcPath = path.join(src, file);
    // Rename _gitignore back to .gitignore (npm ignores .gitignore files)
    const destFile = file === '_gitignore' ? '.gitignore' : file;
    const destPath = path.join(dest, destFile);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

init();
