// backend/src/daemon/index.ts
import picocolors from 'picocolors';
import { text } from '@clack/prompts';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { systemTools } from './tools.js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env variables (specifically OPENAI_API_KEY)
dotenv.config();

/**
 * Starts the local MiniHands daemon.
 * @param pin The pairing PIN used to authenticate with the WebRTC signaling server.
 */
export async function startDaemon(pin: string) {
  console.log(picocolors.gray(`\n[Daemon] Starting background process... (PIN: ${pin})`));
  
  if (!process.env.OPENAI_API_KEY) {
    console.error(picocolors.red('[Daemon] ERROR: OPENAI_API_KEY is not set in .env'));
    process.exit(1);
  }

  // Temporary local test loop replacing WebRTC signaling for now
  console.log(picocolors.yellow(`[Daemon] ⚠️ WebRTC is stubbed out. Entering local simulation mode.`));
  console.log(picocolors.gray(`[Daemon] You can type commands as if sent from the Web UI.\n`));
  
  while (true) {
    const simulatedCommand = await text({
      message: picocolors.cyan('Simulate Web UI Command (type "exit" to quit):'),
      placeholder: 'e.g., Run "ls -la" and tell me what is there.',
    });

    if (!simulatedCommand || typeof simulatedCommand !== 'string' || simulatedCommand.toLowerCase() === 'exit') {
      break;
    }

    console.log(picocolors.gray(`[Daemon] Processing command: "${simulatedCommand}"\n`));

    try {
      const result = await generateText({
        model: openai('gpt-4o'),
        tools: systemTools,
        prompt: `The user sent this remote command from the web UI: "${simulatedCommand}"`,
        system: 'You are the MiniHands local execution agent. You have full access to the user\'s local file system and terminal. Use the provided tools to accomplish the task. Always summarize what you did concisely.',
      });

      console.log(picocolors.green(`\n[Agent]: ${result.text}\n`));
      
      // Print tooling metadata for observability
      const allToolCalls = result.steps.flatMap(s => s.toolCalls);
      if (allToolCalls.length > 0) {
        console.log(picocolors.gray(`  -> Tools used: ${allToolCalls.map(t => t.toolName).join(', ')}\n`));
      }

    } catch (error: any) {
      console.error(picocolors.red(`[Daemon Error]: ${error.message}\n`));
    }
  }

  console.log(picocolors.gray('[Daemon] Shutting down...'));
  process.exit(0);
}
