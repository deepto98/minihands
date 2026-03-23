import { randomUUID } from 'crypto';

interface PendingRequest {
  resolve: (value: boolean) => void;
  reject: (reason?: any) => void;
}

const pendingRequests = new Map<string, PendingRequest>();
let sendControlMessageFn: ((msg: string) => void) | null = null;

export function setControlSender(sender: (msg: string) => void) {
  sendControlMessageFn = sender;
}

export function requestPermission(command: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (!sendControlMessageFn) {
      console.warn('[Permission Bridge] Control channel not ready. Denying by default.');
      resolve(false);
      return;
    }

    const id = randomUUID();
    pendingRequests.set(id, { resolve, reject });

    // Send the request over WebRTC to the UI
    const payload = JSON.stringify({
      type: 'permission_request',
      id,
      command
    });
    
    try {
      sendControlMessageFn(payload);
    } catch (err) {
      pendingRequests.delete(id);
      reject(err);
    }
  });
}

export function handlePermissionResponse(id: string, approved: boolean) {
  const request = pendingRequests.get(id);
  if (request) {
    request.resolve(approved);
    pendingRequests.delete(id);
  } else {
    console.warn(`[Permission Bridge] Received response for unknown/expired request ID: ${id}`);
  }
}
