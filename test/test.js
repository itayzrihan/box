/**
 * BOX Framework Tests
 */

const path = require('path');
const fs = require('fs');
const { BoxParser } = require('../lib/compiler/parser');
const { BoxScoper } = require('../lib/compiler/scoper');
const { BoxCompiler } = require('../lib/compiler/compiler');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('\n📦 BOX Framework Tests\n');

// Parser Tests
console.log('Parser Tests:');

test('should parse UI box with all sections', () => {
  const content = `
<style>.test { color: red; }</style>
<template><div>Hello</div></template>
<script>console.log('test');</script>
  `;
  const result = BoxParser.parse(content, 'test.box');
  assert(result.style.includes('color: red'), 'Style not parsed');
  assert(result.template.includes('<div>Hello</div>'), 'Template not parsed');
  assert(result.script.includes("console.log('test')"), 'Script not parsed');
  assert(!result.isApi, 'Should not be API box');
});

test('should parse API box', () => {
  const content = `
/* BOX_CONFIG: { "method": "POST", "auth": true } */
export default async (req, res) => {
  return { status: 200, data: {} };
};
  `;
  const result = BoxParser.parse(content, 'api+users.box');
  assert(result.isApi, 'Should be API box');
  assert(result.config.method === 'POST', 'Method not parsed');
  assert(result.config.auth === true, 'Auth not parsed');
});

test('should extract includes from template', () => {
  const content = `
<template>
  <include src="./header.box" />
  <include src="./footer.box" />
</template>
  `;
  const result = BoxParser.parse(content, 'main.box');
  assert(result.includes.length === 2, 'Should find 2 includes');
  assert(result.includes[0] === './header.box', 'First include wrong');
  assert(result.includes[1] === './footer.box', 'Second include wrong');
});

test('should extract API route from filename', () => {
  const route1 = BoxParser.extractApiRoute('api+users.box');
  assert(route1.path === '/api/users', 'Path wrong');
  assert(route1.method === 'GET', 'Method should be GET');
  
  const route2 = BoxParser.extractApiRoute('api+post-users.box');
  assert(route2.path === '/api/users', 'POST path wrong');
  assert(route2.method === 'POST', 'Method should be POST');
});

// Scoper Tests
console.log('\nScoper Tests:');

test('should generate unique ID from filename', () => {
  const id1 = BoxScoper.generateId('header.box');
  const id2 = BoxScoper.generateId('footer.box');
  assert(id1 !== id2, 'IDs should be different');
  assert(id1.startsWith('bx-'), 'ID should start with bx-');
  assert(id1.length === 8, 'ID should be 8 chars');
});

test('should scope CSS selectors', () => {
  const css = '.button { color: blue; }';
  const scoped = BoxScoper.scopeCSS(css, 'bx-12345');
  assert(scoped.includes('[data-box="bx-12345"]'), 'Should add scope');
  assert(scoped.includes('.button'), 'Should keep selector');
});

test('should scope HTML with data-box attribute', () => {
  const html = '<div class="test">Hello</div>';
  const scoped = BoxScoper.scopeHTML(html, 'bx-12345');
  assert(scoped.includes('data-box="bx-12345"'), 'Should add data-box');
  assert(scoped.includes('<div class="test">Hello</div>'), 'Should keep content');
});

test('should wrap JS in IIFE', () => {
  const js = 'const x = 1;';
  const scoped = BoxScoper.scopeJS(js, 'bx-12345');
  assert(scoped.includes('(function()'), 'Should start IIFE');
  assert(scoped.includes('})()'), 'Should end IIFE');
  assert(scoped.includes('const x = 1;'), 'Should keep code');
});

test('should convert includes to placeholders', () => {
  const html = '<include src="./test.box" />';
  const scoped = BoxScoper.scopeHTML(html, 'bx-12345');
  assert(scoped.includes('<!-- INCLUDE:./test.box -->'), 'Should convert to placeholder');
});

// Summary
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
