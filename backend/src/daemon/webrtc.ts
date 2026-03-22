import { RTCPeerConnection, RTCDataChannel } from 'werift';
import WebSocket from 'ws';
import { screen } from '@nut-tree-fork/nut-js';
import jpeg from 'jpeg-js';

const SIGNALING_SERVER_URL = process.env.SIGNALING_URL || 'ws://localhost:8080';
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
  controlChannel.onMessage.subscribe((msg) => {
    const text = msg.toString();
    console.log('[WebRTC Control]', text);
    try {
      const payload = JSON.parse(text);
      if (payload.type === 'command') {
        onCommandReceived(payload.command);
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
  const TARGET_FPS = 10;
  const intervalMs = 1000 / TARGET_FPS;

  while (streaming && channel.readyState === 'open') {
    try {
      const startTime = Date.now();

      // Grab screen from nut.js
      const img = await screen.grab();
      const rgb = await img.toRGB();

      // Convert RGB (nut.js) to RGBA (jpeg-js expected) array
      // Wait, let's just send a placeholder for now to ensure WebRTC works 
      // before blocking event loop with manual pixel shifting.
      const testBuffer = Buffer.from('SCREEN_FRAME_PLACEHOLDER');
      channel.send(testBuffer);

      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, intervalMs - elapsed);
      await new Promise(r => setTimeout(r, delay));
    } catch (e) {
      console.error('[WebRTC Screen Stream Error]', e);
      streaming = false;
      break;
    }
  }
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
