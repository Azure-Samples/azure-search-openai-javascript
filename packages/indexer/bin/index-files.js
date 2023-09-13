#!/usr/bin/env node
import process from 'node:process';
import { execSync } from 'node:child_process';
import { run } from '../dist/lib/cli.js';

if ((process.env.NODE_OPTIONS ?? '').includes('--no-warnings')) {
  run(process.argv);
} else {
  // Silence experimental warnings
  try {
    execSync(process.argv.join(' '), {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --no-warnings`,
      },
    });
  } catch {
    // Do nothing
  }
}
