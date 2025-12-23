/**
 * BOX Framework - Clean Command
 * Removes the dist/ folder and build artifacts
 */

const fs = require('fs');
const path = require('path');

/**
 * Recursively remove a directory
 */
function removeDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return false;
  }

  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      removeDir(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  }
  
  fs.rmdirSync(dirPath);
  return true;
}

/**
 * Clean build artifacts
 */
function clean(projectDir = process.cwd()) {
  console.log('\n📦 BOX Clean\n');
  
  const distDir = path.join(projectDir, 'dist');
  let cleaned = false;
  
  // Remove dist folder
  if (fs.existsSync(distDir)) {
    console.log('  🗑️  Removing dist/...');
    removeDir(distDir);
    cleaned = true;
  }
  
  // Remove any .box.cache files if they exist
  const cacheFile = path.join(projectDir, '.box-cache');
  if (fs.existsSync(cacheFile)) {
    console.log('  🗑️  Removing .box-cache...');
    fs.unlinkSync(cacheFile);
    cleaned = true;
  }
  
  // Remove any temporary build files
  const tempFiles = ['.box-build-temp', 'box-build.log'];
  for (const temp of tempFiles) {
    const tempPath = path.join(projectDir, temp);
    if (fs.existsSync(tempPath)) {
      console.log(`  🗑️  Removing ${temp}...`);
      if (fs.statSync(tempPath).isDirectory()) {
        removeDir(tempPath);
      } else {
        fs.unlinkSync(tempPath);
      }
      cleaned = true;
    }
  }
  
  if (cleaned) {
    console.log('\n✅ Clean complete! Ready for a fresh build.\n');
  } else {
    console.log('  ℹ️  Nothing to clean - project is already clean.\n');
  }
  
  return cleaned;
}

module.exports = { clean };
