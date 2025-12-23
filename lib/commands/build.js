/**
 * BOX CLI - build command
 * Compiles src/ to dist/ for production
 */

const path = require('path');
const { BoxCompiler } = require('../compiler/compiler');

async function build(cwd) {
  const srcDir = path.join(cwd, 'src');
  const distDir = path.join(cwd, 'dist');

  const compiler = new BoxCompiler(srcDir, distDir);
  const result = await compiler.build();

  console.log(`\n📊 Build Statistics:`);
  console.log(`   Components: ${result.components}`);
  console.log(`   API Routes: ${result.apiRoutes}`);
}

module.exports = { build };
