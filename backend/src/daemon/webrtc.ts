// @ts-nocheck
import { RTCPeerConnection, RTCDataChannel } from 'werift';
import WebSocket from 'ws';
import screenshot from 'screenshot-desktop';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink } from 'fs/promises';
import { setControlSender, handlePermissionResponse } from './permissionBridge.js';

const execAsync = promisify(exec);

const SIGNALING_SERVER_URL = process.env.SIGNALING_URL || 'ws://localhost:3000';
let ws: WebSocket | null = null;
let rtc: RTCPeerConnection | null = null;

let controlChannel: RTCDataChannel | null = null;
let terminalChannel: RTCDataChannel | null = null;
let chatChannel: RTCDataChannel | null = null;
let screenFeedChannel: RTCDataChannel | null = null;
let streaming = false;

// We export a chat sender so index.ts can push AI messages
export function sendChat(message: string) {
  if (chatChannel && chatChannel.readyState === 'open') {
    chatChannel.send(message);
  }
}

export function sendTerminal(log: string) {
  if (terminalChannel && terminalChannel.readyState === 'open') {
    terminalChannel.send(log);
  }
}

export async function startWebRTC(pin: string, onCommandReceived: (cmd: string) => Promise<void>) {
  console.log(`[WebRTC] Connecting to signaling server for PIN: ${pin}`);
  ws = new WebSocket(SIGNALING_SERVER_URL);

  ws.on('open', () => {
    ws!.send(JSON.stringify({ type: 'auth', role: 'daemon', pin }));
  });

  ws.on('message', async (data) => {
    const msg = JSON.parse(data.toString());

    if (msg.type === 'peer_connected') {
      console.log('[WebRTC] UI Connected. Initializing WebRTC Offer...');
      await setupWebRTCAndInitiateOffer(pin, onCommandReceived);
    } else if (msg.type === 'answer') {
      console.log('[WebRTC] Received Answer from UI.');
      if (rtc && msg.sdp) {
        await rtc.setRemoteDescription(msg);
      }
    } else if (msg.type === 'ice') {
      if (rtc && msg.candidate) {
        await rtc.addIceCandidate(msg.candidate);
      }
    } else if (msg.type === 'peer_disconnected') {
      console.log('[WebRTC] UI Disconnected. Cleaning up WebRTC...');
      teardownWebRTC();
    }
  });

  ws.on('close', () => {
    console.log('[WebRTC] Signaling server disconnected.');
    teardownWebRTC();
  });
}

async function setupWebRTCAndInitiateOffer(pin: string, onCommandReceived: (cmd: string) => Promise<void>) {
  rtc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });

  // Create Data Channels
  controlChannel = rtc.createDataChannel('control');
  terminalChannel = rtc.createDataChannel('terminal');
  chatChannel = rtc.createDataChannel('chat');
  screenFeedChannel = rtc.createDataChannel('screen_feed');

  // Set up listeners for control channel
  controlChannel.onopen = () => {
    setControlSender((msg: string) => {
      if (controlChannel && controlChannel.readyState === 'open') {
        controlChannel.send(msg);
      }
    });
  };

  controlChannel.onMessage.subscribe((msg) => {
    const text = msg.toString();
    console.log('[WebRTC Control]', text);
    try {
      const payload = JSON.parse(text);
      if (payload.type === 'command') {
        onCommandReceived(payload.command);
      } else if (payload.type === 'permission_response') {
        handlePermissionResponse(payload.id, payload.approved);
      }
      // Add emergency stop, mouse coords handlers later
    } catch (e) { /* ignore raw strings */ }
  });

  rtc.connectionStateChange.subscribe((state) => {
    console.log('[WebRTC Connection State Change]', state);
    if (state === 'failed' || state === 'closed' || state === 'disconnected') {
      streaming = false;
      teardownWebRTC();
    }
  });

  screenFeedChannel.stateChanged.subscribe((state) => {
    if (state === 'open') {
      console.log('[WebRTC] Screen Feed Channel Open. Starting stream...');
      streaming = true;
      startScreenStream(screenFeedChannel!);
    }
  });

  // ICE Exchange
  rtc.onIceCandidate.subscribe((candidate) => {
    if (candidate && ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ice', candidate: candidate.toJSON() }));
    }
  });

  // Create Offer
  const offer = await rtc.createOffer();
  await rtc.setLocalDescription(offer);

  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'offer', sdp: rtc.localDescription?.sdp }));
  }
}

async function startScreenStream(channel: RTCDataChannel) {
  const FRAME_DELAY_MS = 250; // ~4 FPS to prevent CPU exhaustion
  
  async function captureLoop() {
    if (!streaming || channel.readyState !== 'open') return;
    
    try {
      let imgBuffer: Buffer;
      if (os.platform() === 'linux') {
        // Bypass screenshot-desktop's broken ImageMagick 'import' fallback
        // Force 'scrot' to write directly to Linux RAM disk for maximum speed
        const tmpPath = `/dev/shm/minihands_frame_${Date.now()}.jpg`;
        await execAsync(`scrot -z -q 70 ${tmpPath}`);
        imgBuffer = await readFile(tmpPath);
        // Fire-and-forget unlink to immediately delete the frame from RAM
        unlink(tmpPath).catch(() => {});
      } else {
        // macOS and Windows fallback
        const result = await screenshot({ format: 'jpg' });
        imgBuffer = Buffer.isBuffer(result) ? result : Buffer.from(result as any);
      }
      
      if (streaming && channel.readyState === 'open') {
        channel.send(imgBuffer);
      }
    } catch (e) {
      console.error('[WebRTC Screen Capture Error]', e);
    }
    
    // Only schedule the next frame AFTER the current one is entirely finished and sent.
    // This allows active GC and prevents spawn flooding memory leaks.
    if (streaming && channel.readyState === 'open') {
      setTimeout(captureLoop, FRAME_DELAY_MS);
    }
  }

  // Kick off the recursive loop
  captureLoop();
}

function teardownWebRTC() {
  streaming = false;
  if (rtc) {
    rtc.close();
    rtc = null;
  }
  controlChannel = null;
  terminalChannel = null;
  chatChannel = null;
  screenFeedChannel = null;
}
