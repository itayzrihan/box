#!/usr/bin/env node

/**
 * create-box-app
 * Scaffolding CLI for BOX Framework
 * Usage: npx create-box-app my-project
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const projectName = process.argv[2] || 'my-box-app';
const targetDir = path.join(process.cwd(), projectName);
const templateDir = path.join(__dirname, '..', 'template');

/**
 * Get VS Code global settings path based on OS
 */
function getVSCodeSettingsPath() {
  const platform = os.platform();
  const home = os.homedir();
  
  if (platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'Code', 'User', 'settings.json');
  } else if (platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'Code', 'User', 'settings.json');
  } else {
    return path.join(home, '.config', 'Code', 'User', 'settings.json');
  }
}

/**
 * Configure VS Code to recognize .box files as HTML globally
 */
function configureVSCodeGlobally() {
  const settingsPath = getVSCodeSettingsPath();
  
  try {
    let settings = {};
    
    // Read existing settings if file exists
    if (fs.existsSync(settingsPath)) {
      const content = fs.readFileSync(settingsPath, 'utf-8');
      // Remove comments from JSONC (VS Code settings can have comments)
      const cleanContent = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      try {
        settings = JSON.parse(cleanContent);
      } catch {
        // If parsing fails, try to work with the raw content
        // Check if .box association already exists
        if (content.includes('"*.box"')) {
          return { success: true, alreadyConfigured: true };
        }
        // Can't safely modify, skip
        return { success: false, reason: 'Could not parse existing settings' };
      }
    }
    
    // Check if already configured
    if (settings['files.associations'] && settings['files.associations']['*.box'] === 'html') {
      return { success: true, alreadyConfigured: true };
    }
    
    // Add file association
    if (!settings['files.associations']) {
      settings['files.associations'] = {};
    }
    settings['files.associations']['*.box'] = 'html';
    
    // Add emmet support
    if (!settings['emmet.includeLanguages']) {
      settings['emmet.includeLanguages'] = {};
    }
    settings['emmet.includeLanguages']['box'] = 'html';
    
    // Ensure directory exists
    const settingsDir = path.dirname(settingsPath);
    if (!fs.existsSync(settingsDir)) {
      fs.mkdirSync(settingsDir, { recursive: true });
    }
    
    // Write updated settings
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    
    return { success: true, alreadyConfigured: false };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

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

    // Configure VS Code globally
    const vscodeResult = configureVSCodeGlobally();
    
    console.log(`✅ Project created successfully!\n`);
    
    // Show VS Code configuration status
    if (vscodeResult.success) {
      if (vscodeResult.alreadyConfigured) {
        console.log(`🎨 VS Code: .box files already configured as HTML\n`);
      } else {
        console.log(`🎨 VS Code: Configured .box files as HTML globally!\n`);
      }
    } else {
      console.log(`💡 Tip: Add this to your VS Code settings for .box syntax highlighting:`);
      console.log(`   "files.associations": { "*.box": "html" }\n`);
    }
    
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
