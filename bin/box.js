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

const args = process.argv.slice(2);
const command = args[0];

const HELP_TEXT = `
╔══════════════════════════════════════════════════════════════╗
║                    📦 BOX Framework CLI                       ║
╚══════════════════════════════════════════════════════════════╝

Usage: box <command> [options]

Commands:
  init              Scaffold a new BOX project
  dev               Start development server with HMR
  build             Compile src/ to dist/ for production
  add <type> <name> Generate a new .box file (ui or api)

Examples:
  box init
  box dev
  box build
  box add ui header
  box add api users

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
        await build(cwd);
        break;
      
      case 'add':
        const type = args[1];
        const name = args[2];
        if (!type || !name) {
          console.error('❌ Usage: box add <type> <name>');
          console.error('   Types: ui, api');
          process.exit(1);
        }
        await add(cwd, type, name);
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
