#!/usr/bin/env node

/**
 * BOX Framework CLI
 * The main entry point for the box command-line interface
 */

const path = require('path');
const fs = require('fs');

// Import core modules
const { init } = require('../lib/commands/init');
const { build } = require('../lib/commands/build');
const { dev } = require('../lib/commands/dev');
const { add } = require('../lib/commands/add');
const { clean } = require('../lib/commands/clean');
const { lint } = require('../lib/commands/lint');

const args = process.argv.slice(2);
const command = args[0];

const HELP_TEXT = `
╔══════════════════════════════════════════════════════════════╗
║                    📦 BOX Framework CLI                       ║
╚══════════════════════════════════════════════════════════════╝

Usage: box <command> [options]

Commands:
  init                  Scaffold a new BOX project
  dev                   Start development server with HMR
  build [options]       Compile src/ to dist/ for production
  add <type> <name>     Generate a new .box file
  clean                 Remove dist/ folder and build artifacts
  lint                  Validate all .box files for errors

Add Types:
  ui      - Interactive UI component
  api     - API endpoint handler
  page    - Full-page with SEO meta tags
  layout  - Layout wrapper (nav, footer, etc.)

Build Options:
  --analyze, -a         Show detailed bundle analysis
  --minify=none         No minification (preserve formatting)
  --minify=basic        Basic minification (default)
  --minify=aggressive   Full minification
  --no-minify           Same as --minify=none

Examples:
  box init
  box dev
  box build
  box build --analyze
  box build --minify=aggressive
  box add ui header
  box add api users
  box add page about
  box add layout main
  box clean
  box lint

Configuration:
  Create box.config.json to set defaults:
  {
    "minify": "basic",
    "outDir": "dist",
    "srcDir": "src",
    "port": 3000,
    "build": { "cleanFirst": false, "analyze": false }
  }

Options:
  --help, -h        Show this help message
  --version, -v     Show version number
`;

async function main() {
  if (!command || command === '--help' || command === '-h') {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  if (command === '--version' || command === '-v') {
    const pkg = require('../package.json');
    console.log(`BOX Framework v${pkg.version}`);
    process.exit(0);
  }

  const cwd = process.cwd();

  try {
    switch (command) {
      case 'init':
        await init(cwd);
        break;
      
      case 'dev':
        await dev(cwd);
        break;
      
      case 'build':
        const analyzeFlag = args.includes('--analyze') || args.includes('-a');
        // Check for minification level flags
        let minifyLevel = null;
        if (args.includes('--minify=none')) minifyLevel = 'none';
        else if (args.includes('--minify=basic')) minifyLevel = 'basic';
        else if (args.includes('--minify=aggressive')) minifyLevel = 'aggressive';
        else if (args.includes('--no-minify')) minifyLevel = 'none';
        
        await build(cwd, { analyze: analyzeFlag, minify: minifyLevel });
        break;
      
      case 'add':
        const type = args[1];
        const name = args[2];
        if (!type || !name) {
          console.error('❌ Usage: box add <type> <name>');
          console.error('   Types: ui, api, page, layout');
          process.exit(1);
        }
        await add(cwd, type, name);
        break;
      
      case 'clean':
        await clean(cwd);
        break;
      
      case 'lint':
        await lint(cwd);
        break;
      
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log(HELP_TEXT);
        process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
