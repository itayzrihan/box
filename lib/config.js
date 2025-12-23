/**
 * BOX Configuration Loader
 * Reads and validates box.config.json or box.config.js
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG = {
  // Minification level: 'none', 'basic', 'aggressive'
  minify: 'basic',
  
  // Output directory
  outDir: 'dist',
  
  // Source directory
  srcDir: 'src',
  
  // Development server port
  port: 3000,
  
  // Enable source maps in dev mode
  sourceMaps: true,
  
  // Build options
  build: {
    // Clean dist before build
    cleanFirst: false,
    
    // Show analyze output after build
    analyze: false
  }
};

/**
 * Load configuration from box.config.json or box.config.js
 * @param {string} projectDir - The project directory
 * @returns {object} - Merged configuration
 */
function loadConfig(projectDir) {
  let userConfig = {};

  // Try box.config.json first
  const jsonPath = path.join(projectDir, 'box.config.json');
  if (fs.existsSync(jsonPath)) {
    try {
      const content = fs.readFileSync(jsonPath, 'utf-8');
      userConfig = JSON.parse(content);
      console.log('📋 Loaded config from box.config.json');
    } catch (error) {
      console.warn(`⚠️  Error parsing box.config.json: ${error.message}`);
    }
  }

  // Try box.config.js if JSON not found
  const jsPath = path.join(projectDir, 'box.config.js');
  if (!fs.existsSync(jsonPath) && fs.existsSync(jsPath)) {
    try {
      // Clear require cache to get fresh config
      delete require.cache[require.resolve(jsPath)];
      userConfig = require(jsPath);
      console.log('📋 Loaded config from box.config.js');
    } catch (error) {
      console.warn(`⚠️  Error loading box.config.js: ${error.message}`);
    }
  }

  // Merge with defaults
  const config = deepMerge(DEFAULT_CONFIG, userConfig);

  // Validate
  validateConfig(config);

  return config;
}

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Validate configuration values
 */
function validateConfig(config) {
  // Validate minify level
  const validMinifyLevels = ['none', 'basic', 'aggressive'];
  if (!validMinifyLevels.includes(config.minify)) {
    console.warn(`⚠️  Invalid minify level: ${config.minify}. Using 'basic'`);
    config.minify = 'basic';
  }

  // Validate port
  if (typeof config.port !== 'number' || config.port < 1 || config.port > 65535) {
    console.warn(`⚠️  Invalid port: ${config.port}. Using 3000`);
    config.port = 3000;
  }
}

/**
 * Create a default box.config.json file
 */
function createDefaultConfig(projectDir) {
  const configPath = path.join(projectDir, 'box.config.json');
  
  if (fs.existsSync(configPath)) {
    console.log('⚠️  box.config.json already exists');
    return;
  }

  const configTemplate = {
    // Minification level: 'none', 'basic', 'aggressive'
    minify: 'basic',
    
    // Output directory
    outDir: 'dist',
    
    // Source directory
    srcDir: 'src',
    
    // Development server port
    port: 3000,
    
    // Build options
    build: {
      // Clean dist before build
      cleanFirst: false,
      
      // Show analyze output after build
      analyze: false
    }
  };

  fs.writeFileSync(configPath, JSON.stringify(configTemplate, null, 2));
  console.log('✅ Created box.config.json');
}

module.exports = { loadConfig, createDefaultConfig, DEFAULT_CONFIG };
