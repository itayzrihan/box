/**
 * BOX Framework - Lint Command
 * Validates .box files for syntax errors, missing sections, and issues
 */

const fs = require('fs');
const path = require('path');

/**
 * Lint a single .box file
 */
function lintBoxFile(filePath) {
  const issues = [];
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const isApiBox = fileName.startsWith('api+');

  if (isApiBox) {
    // Validate API Box
    issues.push(...lintApiBox(content, fileName, filePath));
  } else {
    // Validate UI Box
    issues.push(...lintUiBox(content, fileName, filePath));
  }

  return issues;
}

/**
 * Lint a UI Box file
 */
function lintUiBox(content, fileName, filePath) {
  const issues = [];
  
  // Check for required sections
  const hasStyle = /<style>[\s\S]*?<\/style>/i.test(content);
  const hasTemplate = /<template>[\s\S]*?<\/template>/i.test(content);
  const hasScript = /<script>[\s\S]*?<\/script>/i.test(content);

  if (!hasTemplate) {
    issues.push({
      file: filePath,
      severity: 'error',
      message: 'Missing <template> section',
      suggestion: 'Add a <template>...</template> block with your HTML structure'
    });
  }

  if (!hasStyle) {
    issues.push({
      file: filePath,
      severity: 'warning',
      message: 'Missing <style> section',
      suggestion: 'Consider adding a <style>...</style> block for component styles'
    });
  }

  if (!hasScript) {
    issues.push({
      file: filePath,
      severity: 'info',
      message: 'No <script> section found',
      suggestion: 'Add a <script>...</script> block if you need component logic'
    });
  }

  // Check for unclosed tags
  const styleOpenCount = (content.match(/<style>/gi) || []).length;
  const styleCloseCount = (content.match(/<\/style>/gi) || []).length;
  if (styleOpenCount !== styleCloseCount) {
    issues.push({
      file: filePath,
      severity: 'error',
      message: 'Mismatched <style> tags',
      suggestion: `Found ${styleOpenCount} opening and ${styleCloseCount} closing <style> tags`
    });
  }

  const templateOpenCount = (content.match(/<template>/gi) || []).length;
  const templateCloseCount = (content.match(/<\/template>/gi) || []).length;
  if (templateOpenCount !== templateCloseCount) {
    issues.push({
      file: filePath,
      severity: 'error',
      message: 'Mismatched <template> tags',
      suggestion: `Found ${templateOpenCount} opening and ${templateCloseCount} closing <template> tags`
    });
  }

  const scriptOpenCount = (content.match(/<script>/gi) || []).length;
  const scriptCloseCount = (content.match(/<\/script>/gi) || []).length;
  if (scriptOpenCount !== scriptCloseCount) {
    issues.push({
      file: filePath,
      severity: 'error',
      message: 'Mismatched <script> tags',
      suggestion: `Found ${scriptOpenCount} opening and ${scriptCloseCount} closing <script> tags`
    });
  }

  // Check for include tags with invalid paths
  const includeMatches = content.matchAll(/<include\s+src=["']([^"']+)["']\s*\/?>/gi);
  for (const match of includeMatches) {
    const includePath = match[1];
    const resolvedPath = path.resolve(path.dirname(filePath), includePath);
    
    if (!fs.existsSync(resolvedPath)) {
      issues.push({
        file: filePath,
        severity: 'error',
        message: `Invalid include: "${includePath}" not found`,
        suggestion: `Check the path or create the file: ${resolvedPath}`
      });
    }
  }

  // Check for box-bind without value
  const boxBindMatches = content.matchAll(/box-bind=["']([^"']*)["']/gi);
  for (const match of boxBindMatches) {
    if (!match[1] || match[1].trim() === '') {
      issues.push({
        file: filePath,
        severity: 'error',
        message: 'Empty box-bind attribute',
        suggestion: 'Add a state property name: box-bind="propertyName"'
      });
    }
  }

  // Check for duplicate IDs in template
  const idMatches = content.matchAll(/id=["']([^"']+)["']/gi);
  const ids = [];
  for (const match of idMatches) {
    if (ids.includes(match[1])) {
      issues.push({
        file: filePath,
        severity: 'warning',
        message: `Duplicate ID found: "${match[1]}"`,
        suggestion: 'Use unique IDs or switch to classes for styling'
      });
    } else {
      ids.push(match[1]);
    }
  }

  return issues;
}

/**
 * Lint an API Box file
 */
function lintApiBox(content, fileName, filePath) {
  const issues = [];

  // Check for BOX_CONFIG
  const hasConfig = /\/\*\s*BOX_CONFIG\s*:/.test(content);
  if (!hasConfig) {
    issues.push({
      file: filePath,
      severity: 'warning',
      message: 'Missing BOX_CONFIG comment',
      suggestion: 'Add /* BOX_CONFIG: { "method": "GET", "auth": false } */ at the top'
    });
  } else {
    // Validate BOX_CONFIG JSON
    const configMatch = content.match(/\/\*\s*BOX_CONFIG\s*:\s*(\{[^}]+\})\s*\*\//);
    if (configMatch) {
      try {
        const config = JSON.parse(configMatch[1]);
        
        // Check for valid method
        const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        if (config.method && !validMethods.includes(config.method.toUpperCase())) {
          issues.push({
            file: filePath,
            severity: 'error',
            message: `Invalid HTTP method: "${config.method}"`,
            suggestion: `Use one of: ${validMethods.join(', ')}`
          });
        }
      } catch (e) {
        issues.push({
          file: filePath,
          severity: 'error',
          message: 'Invalid BOX_CONFIG JSON',
          suggestion: 'Check JSON syntax in BOX_CONFIG comment'
        });
      }
    }
  }

  // Check for export default
  const hasExport = /export\s+default\s+async/.test(content);
  if (!hasExport) {
    issues.push({
      file: filePath,
      severity: 'error',
      message: 'Missing default export',
      suggestion: 'Add: export default async (req, res, ctx) => { ... }'
    });
  }

  // Check for proper function signature
  const signatureMatch = content.match(/export\s+default\s+async\s*\(([^)]*)\)/);
  if (signatureMatch) {
    const params = signatureMatch[1].split(',').map(p => p.trim());
    if (params.length < 2) {
      issues.push({
        file: filePath,
        severity: 'warning',
        message: 'Incomplete function signature',
        suggestion: 'Use: export default async (req, res, ctx) => { ... }'
      });
    }
  }

  // Check for return statement
  const hasReturn = /return\s*\{/.test(content);
  if (!hasReturn) {
    issues.push({
      file: filePath,
      severity: 'warning',
      message: 'No return statement found',
      suggestion: 'Return { status: 200, data: {...} } or { status: 500, error: "..." }'
    });
  }

  return issues;
}

/**
 * Lint all .box files in a directory
 */
function lint(projectDir = process.cwd()) {
  console.log('\n📦 BOX Lint\n');
  
  const srcDir = path.join(projectDir, 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.log('  ❌ No src/ folder found. Are you in a BOX project?\n');
    return { errors: 1, warnings: 0, info: 0, issues: [] };
  }

  const allIssues = [];
  let filesChecked = 0;

  // Find all .box files
  function findBoxFiles(dir) {
    const files = fs.readdirSync(dir);
    const boxFiles = [];
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        boxFiles.push(...findBoxFiles(filePath));
      } else if (file.endsWith('.box')) {
        boxFiles.push(filePath);
      }
    }
    
    return boxFiles;
  }

  const boxFiles = findBoxFiles(srcDir);
  
  console.log(`  📁 Checking ${boxFiles.length} .box file(s)...\n`);

  for (const filePath of boxFiles) {
    filesChecked++;
    const issues = lintBoxFile(filePath);
    allIssues.push(...issues);
  }

  // Count by severity
  const errors = allIssues.filter(i => i.severity === 'error').length;
  const warnings = allIssues.filter(i => i.severity === 'warning').length;
  const infos = allIssues.filter(i => i.severity === 'info').length;

  // Print issues grouped by file
  const fileGroups = {};
  for (const issue of allIssues) {
    if (!fileGroups[issue.file]) {
      fileGroups[issue.file] = [];
    }
    fileGroups[issue.file].push(issue);
  }

  for (const [file, issues] of Object.entries(fileGroups)) {
    const relPath = path.relative(projectDir, file);
    console.log(`  📄 ${relPath}`);
    
    for (const issue of issues) {
      const icon = issue.severity === 'error' ? '❌' : 
                   issue.severity === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`     ${icon} ${issue.message}`);
      console.log(`        💡 ${issue.suggestion}`);
    }
    console.log();
  }

  // Summary
  console.log('  ─────────────────────────────────────');
  console.log(`  📊 Results: ${filesChecked} files checked`);
  
  if (errors === 0 && warnings === 0 && infos === 0) {
    console.log('  ✅ No issues found! Your code looks great.\n');
  } else {
    console.log(`     ❌ ${errors} error(s)`);
    console.log(`     ⚠️  ${warnings} warning(s)`);
    console.log(`     ℹ️  ${infos} info(s)\n`);
  }

  return { errors, warnings, info: infos, issues: allIssues };
}

module.exports = { lint, lintBoxFile };
