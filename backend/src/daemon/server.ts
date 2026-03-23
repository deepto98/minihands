import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Peer {
  ws: WebSocket;
  role: 'daemon' | 'client';
}

export function startServer(pin: string): Promise<number> {
  return new Promise((resolve) => {
    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });

    // Serve static files from the compiled React UI
    // In dev (from src/daemon): ../../../../web-ui/dist
    // In prod (from dist/): web-ui
    const distPathDev = path.join(__dirname, '../../../../web-ui/dist');
    const distPathProd = path.join(__dirname, '../web-ui'); // When __dirname is dist, it points to dist/web-ui

    app.use(express.static(distPathDev));
    app.use(express.static(distPathProd));

    // Catch-all fallback for React Router SPA
    app.use((req, res) => {
      // Try dev path first, fallback to prod path
      res.sendFile(path.join(distPathDev, 'index.html'), (err) => {
        if (err) {
          res.sendFile(path.join(distPathProd, 'index.html'));
        }
      });
    });

    const rooms = new Map<string, { daemon?: Peer; client?: Peer }>();

    wss.on('connection', (ws) => {
      let currentPin: string | null = null;
      let currentRole: 'daemon' | 'client' | null = null;

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());

          if (data.type === 'auth') {
            const { pin: incomingPin, role } = data;
            if (!incomingPin || (role !== 'daemon' && role !== 'client') || incomingPin !== pin) {
              ws.send(JSON.stringify({ type: 'error', message: 'Invalid auth payload or incorrect PIN' }));
              return;
            }

            currentPin = incomingPin;
            currentRole = role;

            if (!rooms.has(incomingPin)) {
              rooms.set(incomingPin, {});
            }
            const room = rooms.get(incomingPin)!;

            if (role === 'daemon') room.daemon = { ws, role };
            if (role === 'client') room.client = { ws, role };

            ws.send(JSON.stringify({ type: 'authenticated', role }));
            // console.log(`[${incomingPin}] ${role} connected.`);

            // Notify if both are connected
            if (room.daemon && room.client) {
              console.log(`[MiniHands] Client connected! Establishing WebRTC tunnel...`);
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
          // console.log(`[${currentPin}] ${currentRole} disconnected.`);
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
            }
          }
        }
      });
    });

    const PORT = parseInt(process.env.PORT || '3000', 10);
    server.listen(PORT, '0.0.0.0', () => {
      resolve(PORT);
    });
  });
}
