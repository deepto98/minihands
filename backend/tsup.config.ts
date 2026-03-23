import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  outDir: 'dist',
  bundle: true,
  minify: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
