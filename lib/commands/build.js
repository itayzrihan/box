/**
 * BOX CLI - build command
 * Compiles src/ to dist/ for production
 */

const fs = require('fs');
const path = require('path');
const { BoxCompiler } = require('../compiler/compiler');
const { BoxMinifier } = require('../compiler/minifier');
const { loadConfig } = require('../config');
const { clean } = require('./clean');

async function build(cwd, options = {}) {
  // Load configuration
  const config = loadConfig(cwd);
  
  // Override config with CLI options
  if (options.minify) {
    config.minify = options.minify;
  }

  // Set minification level
  BoxMinifier.setLevel(config.minify);
  console.log(`🔧 Minification: ${config.minify}`);

  // Clean first if configured
  if (config.build.cleanFirst) {
    await clean(cwd);
  }

  const srcDir = path.join(cwd, config.srcDir || 'src');
  const distDir = path.join(cwd, config.outDir || 'dist');

  const compiler = new BoxCompiler(srcDir, distDir);
  const result = await compiler.build();

  console.log(`\n📊 Build Statistics:`);
  console.log(`   Components: ${result.components}`);
  console.log(`   API Routes: ${result.apiRoutes}`);

  // Show detailed analysis if requested via CLI or config
  if (options.analyze || config.build.analyze) {
    await showBuildAnalysis(distDir, result);
  }
}

/**
 * Show detailed build analysis
 */
async function showBuildAnalysis(distDir, result) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`                    📈 BUILD ANALYSIS`);
  console.log(`${'═'.repeat(60)}\n`);

  const files = [
    { name: 'index.html', type: 'HTML' },
    { name: 'style.css', type: 'CSS' },
    { name: 'app.js', type: 'JavaScript' },
    { name: 'server.js', type: 'Server' }
  ];

  let totalSize = 0;
  const fileSizes = [];

  for (const file of files) {
    const filePath = path.join(distDir, file.name);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const size = stat.size;
      totalSize += size;
      fileSizes.push({ ...file, size });
    }
  }

  // File size breakdown
  console.log('📁 Output Files:\n');
  for (const file of fileSizes) {
    const sizeStr = formatBytes(file.size);
    const bar = generateBar(file.size, totalSize);
    console.log(`   ${file.name.padEnd(15)} ${sizeStr.padStart(10)} ${bar}`);
  }

  console.log(`   ${'─'.repeat(45)}`);
  console.log(`   ${'Total'.padEnd(15)} ${formatBytes(totalSize).padStart(10)}\n`);

  // Gzip estimates
  console.log('📦 Estimated Gzip Sizes:\n');
  for (const file of fileSizes) {
    // Rough estimate: gzip typically achieves 60-70% compression for text
    const gzipSize = Math.round(file.size * 0.35);
    console.log(`   ${file.name.padEnd(15)} ~${formatBytes(gzipSize).padStart(9)}`);
  }

  // Component breakdown
  console.log(`\n🧩 Component Summary:\n`);
  console.log(`   UI Components:    ${result.components}`);
  console.log(`   API Endpoints:    ${result.apiRoutes}`);
  console.log(`   Total Modules:    ${result.components + result.apiRoutes}`);

  // Build recommendations
  console.log(`\n💡 Recommendations:\n`);
  
  if (totalSize > 500 * 1024) {
    console.log('   ⚠️  Bundle size is large (>500KB). Consider:');
    console.log('      • Splitting large components');
    console.log('      • Lazy loading non-critical components');
  } else if (totalSize > 200 * 1024) {
    console.log('   📊 Bundle size is moderate. Consider:');
    console.log('      • Enabling aggressive minification');
    console.log('      • Reviewing large components');
  } else {
    console.log('   ✅ Bundle size is optimal!');
  }

  if (result.components > 20) {
    console.log('   📦 Many components detected. Consider:');
    console.log('      • Code splitting for routes');
    console.log('      • Grouping related components');
  }

  console.log(`\n${'═'.repeat(60)}\n`);
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate a visual bar for size comparison
 */
function generateBar(size, total) {
  const maxWidth = 20;
  const width = Math.round((size / total) * maxWidth);
  const filled = '█'.repeat(width);
  const empty = '░'.repeat(maxWidth - width);
  const percent = ((size / total) * 100).toFixed(1);
  return `${filled}${empty} ${percent}%`;
}

module.exports = { build };
