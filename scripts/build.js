import { build } from 'esbuild';
import { readdirSync, statSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';

// Find all handler files recursively
function findHandlers(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    
    if (statSync(filePath).isDirectory()) {
      findHandlers(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.test.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const handlers = findHandlers('./src/handlers');

// Clean and create dist directory
rmSync('./dist', { recursive: true, force: true });
mkdirSync('./dist', { recursive: true });

// Build each handler as a separate bundle
for (const handler of handlers) {
  // Mantém a estrutura de pastas em dist/
  const outfile = handler
    .replace('src/', 'dist/')
    .replace('.ts', '.js');
  
  // Cria os diretórios necessários
  mkdirSync(dirname(outfile), { recursive: true });
  
  await build({
    entryPoints: [handler],
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

console.log(`\n✅ Built ${handlers.length} Lambda handlers successfully!`);
