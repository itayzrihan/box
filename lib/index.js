/**
 * BOX Framework - Main Library Export
 */

const { BoxCompiler } = require('./compiler/compiler');
const { BoxParser } = require('./compiler/parser');
const { BoxScoper } = require('./compiler/scoper');
const { BoxServer } = require('./server/server');

module.exports = {
  BoxCompiler,
  BoxParser,
  BoxScoper,
  BoxServer
};
