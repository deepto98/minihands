// backend/src/daemon/index.ts
import picocolors from 'picocolors';
import { text } from '@clack/prompts';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { systemTools } from './tools.js';
import { startWebRTC, sendChat } from './webrtc.js';
import { checkOSDependencies } from './osHandler.js';
import { startServer } from './server.js';
import { checkCloudflaredInstalled, startEphemeralTunnel } from './tunnelManager.js';
import { getConfig } from '../db/config.js';
import path from 'path';

/**
 * Starts the local MiniHands daemon.
 * @param pin The pairing PIN used to authenticate with the WebRTC signaling server.
 */
export async function startDaemon(pin: string) {
  console.log(picocolors.gray(`\n[Daemon] Starting background process... (PIN: ${pin})`));

  const apiKey = getConfig('openai_api_key');
  if (!apiKey) {
    console.error(picocolors.red('[Daemon] ERROR: OPENAI_API_KEY is not set in config. Run "minihands init".'));
    process.exit(1);
  }

  await checkOSDependencies();
  await checkCloudflaredInstalled();

  console.log(picocolors.yellow(`[Daemon] Starting local API & Signaling server...`));
  const port = await startServer(pin);
  
  try {
    const tunnelUrl = await startEphemeralTunnel(port);
    console.log(picocolors.green(`\n=== MINIHANDS LIVE ===`));
    console.log(`Open this URL on any device to connect: ${picocolors.cyan(tunnelUrl)}`);
    console.log(`Pairing PIN: ${picocolors.bold(picocolors.green(pin))}`);
    console.log(picocolors.green(`======================\n`));
  } catch (err) {
    console.warn(picocolors.yellow(`[Daemon] Proceeding with Local-Only access. (http://localhost:${port})`));
  }
  
  console.log(picocolors.yellow(`[Daemon] Entering WebRTC listener mode.`));

  await startWebRTC(pin, async (simulatedCommand: string) => {
    console.log(picocolors.gray(`[Daemon] Processing command from UI: "${simulatedCommand}"\n`));

    try {
      const result = await generateText({
        model: openai('gpt-4o') as any,
        maxSteps: 10,
        tools: systemTools,
        prompt: `The user sent this remote command from the web UI: "${simulatedCommand}"`,
        system: `You are the MiniHands local execution agent. You have full access to the user's local file system and terminal. 
Use the provided tools to accomplish the task. Always summarize what you did concisely.
CRITICAL: If a tool execution is denied by the user, explain what happened and do NOT retry it. Find an alternative or stop.`,
        onStepFinish: ({ text, toolCalls, toolResults }) => {
          if (toolCalls && toolCalls.length > 0) {
            const toolNames = toolCalls.map(t => t.toolName).join(', ');
            console.log(picocolors.gray(`  -> Agent used tools: ${toolNames}`));
            sendChat(JSON.stringify({ role: 'agent', text: `*[Executing] ${toolNames}...*` }));
          }
        }
      });

      console.log(picocolors.green(`\n[Agent]: ${result.text}\n`));
      // Relay the final response back to the Web UI DataChannel
      sendChat(JSON.stringify({ role: 'agent', text: result.text }));
      const allToolCalls = result.steps?.flatMap(s => s.toolCalls) || [];
      if (allToolCalls.length > 0) {
        console.log(picocolors.gray(`  -> Tools used: ${allToolCalls.map(t => t.toolName).join(', ')}\n`));
      }

    } catch (error: any) {
      console.error(picocolors.red(`[Daemon Error]: ${error.message}\n`));
      sendChat(JSON.stringify({ role: 'system', text: `Error: ${error.message}` }));
    }
  });

  // Keep process alive listening for WEBRTC events
  console.log(picocolors.gray('[Daemon] Idling, waiting for P2P connection...'));
}
