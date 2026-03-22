import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

const app = express();
// Allow basic health check
app.get('/', (req, res) => res.send('MiniHands Signaling Server is operational.'));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

interface Peer {
  ws: WebSocket;
  role: 'daemon' | 'client';
}

// Maps 6-digit PIN -> { daemon?, client? }
const rooms = new Map<string, { daemon?: Peer; client?: Peer }>();

wss.on('connection', (ws) => {
  let currentPin: string | null = null;
  let currentRole: 'daemon' | 'client' | null = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'auth') {
        const { pin, role } = data;
        if (!pin || (role !== 'daemon' && role !== 'client')) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid auth payload' }));
          return;
        }

        currentPin = pin;
        currentRole = role;
        
        if (!rooms.has(pin)) {
          rooms.set(pin, {});
        }
        const room = rooms.get(pin)!;
        
        if (role === 'daemon') room.daemon = { ws, role };
        if (role === 'client') room.client = { ws, role };

        ws.send(JSON.stringify({ type: 'authenticated', role }));
        console.log(`[${pin}] ${role} connected.`);

        // Notify if both are connected
        if (room.daemon && room.client) {
          console.log(`[${pin}] Both peers connected. Ready for SDP/ICE exchange.`);
          room.daemon.ws.send(JSON.stringify({ type: 'peer_connected' }));
          room.client.ws.send(JSON.stringify({ type: 'peer_connected' }));
        }
        return;
      }

      // Route signaling messages (SDP offers, answers, ICE candidates)
      if (['offer', 'answer', 'ice'].includes(data.type) && currentPin && currentRole) {
        const room = rooms.get(currentPin);
        if (room) {
          const target = currentRole === 'daemon' ? room.client : room.daemon;
          if (target && target.ws.readyState === WebSocket.OPEN) {
            target.ws.send(message.toString());
          }
        }
      }
      
    } catch (e) {
      console.error('Signaling processing error:', e);
    }
  });

  ws.on('close', () => {
    if (currentPin && currentRole) {
      console.log(`[${currentPin}] ${currentRole} disconnected.`);
      const room = rooms.get(currentPin);
      if (room) {
        if (currentRole === 'daemon') delete room.daemon;
        if (currentRole === 'client') delete room.client;
        
        const other = currentRole === 'daemon' ? room.client : room.daemon;
        if (other && other.ws.readyState === WebSocket.OPEN) {
          other.ws.send(JSON.stringify({ type: 'peer_disconnected' }));
        }
        
        if (!room.daemon && !room.client) {
          rooms.delete(currentPin);
          console.log(`[${currentPin}] Room destroyed.`);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`MiniHands Signaling Server running on port ${PORT}`);
});
