// src/index.ts
import { Command } from 'commander';
import { runInitPrompt } from './cli/index.js';
import picocolors from 'picocolors';

const program = new Command();

program
  .name('minihands')
  .description('MiniHands: Secure, WebRTC-enabled local AI daemon')
  .version('1.0.0');

// Register the 'init' command
program
  .command('init')
  .description('Initialize MiniHands and deploy the control plane')
  .action(async () => {
    try {
      await runInitPrompt();
    } catch (error) {
      console.error(picocolors.red(`Initialization failed: ${error}`));
      process.exit(1);
    }
  });

// Parse terminal arguments
program.parse(process.argv);
