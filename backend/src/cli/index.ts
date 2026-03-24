import { intro, outro, text, confirm, spinner, isCancel, cancel } from '@clack/prompts';
import picocolors from 'picocolors';
import { startDaemon } from '../daemon/index.js';
import { setConfig, getConfig, initDB } from '../db/config.js';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsyncPromisified = promisify(exec);

/**
 * Runs the interactive CLI prompt to initialize MiniHands.
 */
export async function runInitPrompt() {
  await initDB();
  intro(picocolors.inverse(' MiniHands Initialization '));

  // Prompt for API key
  const apiKey = await text({
    message: 'Enter your OpenAI API Key (will be saved securely to ~/.minihands/config.db):',
    placeholder: 'sk-proj-...',
    validate(value) {
      if (!value || value.length === 0) return 'API key is required!';
    },
  });

  if (isCancel(apiKey)) {
    cancel('Setup cancelled.');
    process.exit(0);
  }
  
  // Save API key securely in SQLite
  setConfig('openai_api_key', apiKey as string);

  outro("Setup complete! You can now run 'minihands setup' or 'minihands start'.");
}

/**
 * Runs the setup prompt for cloudflared tunnel binding
 */
export async function runSetupPrompt() {
  await initDB();
  intro(picocolors.inverse(' MiniHands Cloudflare Setup '));
  
  console.log(picocolors.gray('Running cloudflared login...'));
  
  // Notice we use spawn with inherit to let the user interact with the cloudflared login process
  const loginPrompt = await confirm({
    message: 'We will now open your browser to log into Cloudflare Zero Trust. Proceed?',
  });

  if (!isCancel(loginPrompt) && loginPrompt) {
     const child = spawn('cloudflared', ['tunnel', 'login'], { stdio: 'inherit' });
     await new Promise((resolve) => {
       child.on('exit', resolve);
     });
     
     const domain = await text({
       message: 'Enter the domain name you want to bind to (e.g. minihands.yourdomain.com):',
       validate(value) {
         if (!value || value.length === 0) return 'Domain is required!';
       },
     });

     if (isCancel(domain)) {
        cancel('Setup cancelled.');
        process.exit(0);
     }
     
     const s = spinner();
     s.start('Creating persistent tunnel...');
     try {
       // A realistic setup script would create the tunnel, create the DNS route, etc.
       await execAsyncPromisified(`cloudflared tunnel create minihands-prod`);
       await execAsyncPromisified(`cloudflared tunnel route dns minihands-prod ${domain}`);
       setConfig('custom_domain', domain as string);
       setConfig('tunnel_id', 'minihands-prod');
       s.stop(picocolors.green('Tunnel strictly bound!'));
       outro('Custom domain setup is complete. Run "minihands start"');
     } catch (e: any) {
        s.stop(picocolors.red('Tunnel creation failed.'));
        console.error(e.message);
     }
  } else {
     cancel('Setup cancelled.');
     process.exit(0);
  }
}

/**
 * The standard start sequence
 */
export async function runStartSequence() {
  await initDB();
  
  const apiKey = getConfig('openai_api_key');
  if (!apiKey) {
    console.error(picocolors.red('API Key missing. Run "minihands init" first.'));
    process.exit(1);
  }

  // Determine PIN
  let pin = getConfig('static_pin') as string;
  if (!pin) {
    const s = spinner();
    s.start('Generating ephemeral PIN...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    pin = Math.floor(100000 + Math.random() * 900000).toString();
    s.stop(picocolors.green('Pairing PIN generated!'));
  }

  // Display pairing PIN beautifully
  console.log('\n┌─────────────────────────────┐');
  console.log(`│  Your Local Pairing PIN: ${picocolors.bold(picocolors.cyan(pin))} │`);
  console.log('└─────────────────────────────┘\n');

  // Hand off to the daemon process (now async, so we await)
  await startDaemon(pin);
}
