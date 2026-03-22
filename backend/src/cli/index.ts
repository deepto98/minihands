// backend/src/cli/index.ts
import { intro, outro, text, confirm, spinner, isCancel, cancel } from '@clack/prompts';
import picocolors from 'picocolors';
import fs from 'fs';
import path from 'path';
import { startDaemon } from '../daemon/index.js';

/**
 * Runs the interactive CLI prompt to initialize MiniHands.
 */
export async function runInitPrompt() {
  intro(picocolors.inverse(' MiniHands Initialization '));

  // Prompt for API key
  const apiKey = await text({
    message: 'Enter your OpenAI API Key (will be saved securely to .env):',
    placeholder: 'sk-proj-...',
    validate(value) {
      if (!value || value.length === 0) return 'API key is required!';
    },
  });

  if (isCancel(apiKey)) {
    cancel('Setup cancelled.');
    process.exit(0);
  }
  
  // Save API key securely
  const envPath = path.resolve(process.cwd(), '.env');
  fs.writeFileSync(envPath, `OPENAI_API_KEY=${apiKey}\n`);

  // Prompt for deployment
  const shouldDeploy = await confirm({
    message: 'Deploy control plane to Vercel?',
  });

  if (isCancel(shouldDeploy)) {
    cancel('Setup cancelled.');
    process.exit(0);
  }

  const s = spinner();
  s.start('Generating secure pairing PIN...');
  
  // Simulate PIN generation
  await new Promise(resolve => setTimeout(resolve, 1000));
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  
  s.stop(picocolors.green('Pairing PIN generated!'));

  // Display pairing PIN beautifully
  console.log('\n┌─────────────────────────────┐');
  console.log(`│  Your Pairing PIN: ${picocolors.bold(picocolors.cyan(pin))}   │`);
  console.log('└─────────────────────────────┘\n');

  outro("Setup complete! Starting local daemon...");

  // Hand off to the daemon process (now async, so we await)
  await startDaemon(pin);
}
