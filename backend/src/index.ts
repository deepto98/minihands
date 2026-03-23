import { Command } from 'commander';
import { runInitPrompt, runSetupPrompt, runStartSequence } from './cli/index.js';
import picocolors from 'picocolors';

const program = new Command();

program
  .name('minihands')
  .description('MiniHands: Secure, WebRTC-enabled local AI daemon')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize MiniHands configuration (API Keys)')
  .action(async () => {
    try {
      await runInitPrompt();
    } catch (error) {
      console.error(picocolors.red(`Initialization failed: ${error}`));
      process.exit(1);
    }
  });

program
  .command('setup')
  .description('Setup Cloudflare Zero Trust tunnel for a custom domain')
  .action(async () => {
    try {
      await runSetupPrompt();
    } catch (error) {
       console.error(picocolors.red(`Setup failed: ${error}`));
       process.exit(1);
    }
  });

program
  .command('start')
  .description('Start the local daemon and UI server')
  .action(async () => {
    try {
       await runStartSequence();
    } catch (error) {
       console.error(picocolors.red(`Daemon crash: ${error}`));
       process.exit(1);
    }
  });

// Parse terminal arguments
program.parseAsync(process.argv);
