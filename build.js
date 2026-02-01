/**
 * Build script for SMILES Claude Skill
 * Bundles smiles-js and skill code into a single distributable file
 */

import * as esbuild from 'esbuild';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function build() {
  console.log('Building SMILES Claude Skill...');

  // Ensure dist directory exists
  const distDir = join(__dirname, 'dist');
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }

  try {
    // Bundle the skill code with smiles-js
    await esbuild.build({
      entryPoints: [join(__dirname, 'src', 'index.js')],
      bundle: true,
      platform: 'node',
      target: 'node16',
      format: 'esm',
      outfile: join(distDir, 'skill.js'),
      minify: true,
      sourcemap: false,
      external: ['@rdkit/rdkit'], // Mark optional dependencies as external
      banner: {
        js: '// SMILES Claude Skill - Bundled with smiles-js\n'
      }
    });

    console.log('✓ Built skill.js');

    // Copy skill.json to dist
    copyFileSync(
      join(__dirname, 'skill.json'),
      join(distDir, 'skill.json')
    );
    console.log('✓ Copied skill.json');

    // Copy skill-prompt.md to dist
    copyFileSync(
      join(__dirname, 'skill-prompt.md'),
      join(distDir, 'skill-prompt.md')
    );
    console.log('✓ Copied skill-prompt.md');

    // Create package.json for the dist
    const pkgJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));
    const distPkg = {
      name: pkgJson.name,
      version: pkgJson.version,
      description: pkgJson.description,
      main: 'skill.js',
      type: 'module',
      author: pkgJson.author,
      license: pkgJson.license
    };
    writeFileSync(
      join(distDir, 'package.json'),
      JSON.stringify(distPkg, null, 2)
    );
    console.log('✓ Created dist package.json');

    console.log('\n✓ Build complete! Output in dist/');
    console.log(`  - skill.js (${(await getFileSize(join(distDir, 'skill.js'))).toFixed(1)} KB)`);
    console.log('  - skill.json');
    console.log('  - skill-prompt.md');
    console.log('  - package.json');

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

async function getFileSize(filePath) {
  const stats = await import('fs/promises').then(fs => fs.stat(filePath));
  return stats.size / 1024;
}

build();
