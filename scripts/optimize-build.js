#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Build Optimization Script');
console.log('============================');

// Check for large files in dist
function analyzeBuildSize() {
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ dist folder not found. Run build first.');
    return;
  }

  console.log('\n📊 Build Size Analysis:');
  
  const files = fs.readdirSync(distPath, { recursive: true });
  let totalSize = 0;
  
  files.forEach(file => {
    if (typeof file === 'string') {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile()) {
        const sizeInKB = Math.round(stats.size / 1024);
        totalSize += sizeInKB;
        
        if (sizeInKB > 100) {
          console.log(`⚠️  Large file: ${file} (${sizeInKB}KB)`);
        }
      }
    }
  });
  
  console.log(`\n📦 Total build size: ${Math.round(totalSize / 1024)}MB`);
  
  if (totalSize > 5000) {
    console.log('⚠️  Build size is large. Consider:');
    console.log('   - Code splitting');
    console.log('   - Tree shaking');
    console.log('   - Lazy loading');
    console.log('   - Image optimization');
  }
}

// Check for unused dependencies
function checkDependencies() {
  console.log('\n📋 Dependency Check:');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});
  
  console.log(`📦 Production dependencies: ${dependencies.length}`);
  console.log(`🔧 Development dependencies: ${devDependencies.length}`);
  
  // Check for common large dependencies
  const largeDeps = ['lodash', 'moment', 'date-fns', 'axios'];
  const foundLargeDeps = dependencies.filter(dep => largeDeps.includes(dep));
  
  if (foundLargeDeps.length > 0) {
    console.log('⚠️  Large dependencies found:', foundLargeDeps.join(', '));
    console.log('   Consider using lighter alternatives');
  }
}

// Main execution
try {
  analyzeBuildSize();
  checkDependencies();
  
  console.log('\n✅ Build optimization analysis complete!');
  console.log('\n💡 Tips for faster deployments:');
  console.log('   - Use npm ci instead of npm install');
  console.log('   - Enable build caching');
  console.log('   - Use CDN for large libraries');
  console.log('   - Optimize images and assets');
  console.log('   - Enable gzip compression');
  
} catch (error) {
  console.error('❌ Error during analysis:', error.message);
  process.exit(1);
}
