import { build } from 'esbuild';
import { mkdirSync, rmSync } from 'fs';
import { join } from 'path';

// Lista de handlers consolidados
const handlers = [
  'certificates',
  'formations',
  'projects',
  'knowledge'
];

// Clean and create dist directory
rmSync('./dist', { recursive: true, force: true });
mkdirSync('./dist/handlers', { recursive: true });

console.log('🔨 Building consolidated Lambda handlers...\n');

// Build each consolidated handler
for (const handler of handlers) {
  const entryPoint = join('src', 'handlers', `${handler}.ts`);
  const outfile = join('dist', 'handlers', `${handler}.js`);
  
  await build({
    entryPoints: [entryPoint],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs', // CommonJS for AWS Lambda
    outfile: outfile,
    external: ['@aws-sdk/*'],
    minify: true,
    sourcemap: true,
    absWorkingDir: process.cwd(),
  });
  
  console.log(`✓ Built: ${outfile}`);
}

console.log(`\n✅ Successfully built ${handlers.length} consolidated Lambda handlers!`);
console.log(`📦 Output: dist/handlers/`);
console.log(`🎯 Reduction: 16 handlers → 4 handlers (-75%)`);

