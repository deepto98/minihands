// src/daemon/index.ts
import picocolors from 'picocolors';

/**
 * Starts the local MiniHands daemon.
 * @param pin The pairing PIN used to authenticate with the WebRTC signaling server.
 */
export function startDaemon(pin: string) {
  console.log(picocolors.gray(`[Daemon] Starting background process... (PIN: ${pin})`));
  console.log(picocolors.gray(`[Daemon] Waiting for WebRTC connection from control plane...`));
  
  // TODO: Initialize WebRTC signaling, native automation (nut.js), and LLM orchestration
}
