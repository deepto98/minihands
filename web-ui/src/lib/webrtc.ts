export class WebRTCClient {
  static instance = new WebRTCClient();
  
  ws: WebSocket | null = null;
  rtc: RTCPeerConnection | null = null;
  controlChannel: RTCDataChannel | null = null;
  
  connected = false;
  pin: string | null = null;
  
  // React Callbacks
  onChat: ((msg: any) => void) | null = null;
  onTerminal: ((log: string) => void) | null = null;
  onScreenFrame: ((buffer: ArrayBuffer) => void) | null = null;
  onStatusChange: ((status: string) => void) | null = null;
  onPermissionRequest: ((id: string, command: string) => void) | null = null;

  async connect(pin: string, signalUrl?: string) {
    if (!signalUrl) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      signalUrl = `${protocol}//${window.location.host}`;
    }

    this.pin = pin;
    this.ws = new WebSocket(signalUrl);
    
    this.ws.onopen = () => {
      this.ws?.send(JSON.stringify({ type: 'auth', role: 'client', pin }));
      this.setStatus('Authenticating...');
    };

    this.ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'peer_connected') {
        this.setStatus('Daemon found. Establishing WebRTC P2P tunnel...');
      } else if (msg.type === 'offer') {
        await this.handleOffer(msg.sdp);
      } else if (msg.type === 'ice') {
        if (this.rtc) await this.rtc.addIceCandidate(new RTCIceCandidate(msg.candidate));
      }
    };
  }

  async handleOffer(sdp: string) {
    this.rtc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    
    this.rtc.onicecandidate = (e) => {
      if (e.candidate && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ice', candidate: e.candidate.toJSON() }));
      }
    };

    this.rtc.ondatachannel = (e) => {
      const channel = e.channel;
      if (channel.label === 'control') {
        this.controlChannel = channel;
        channel.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === 'permission_request' && this.onPermissionRequest) {
              this.onPermissionRequest(data.id, data.command);
            }
          } catch (err) { }
        };
      } else if (channel.label === 'chat') {
        channel.onmessage = (e) => {
          if (this.onChat) this.onChat(JSON.parse(e.data));
        };
      } else if (channel.label === 'terminal') {
        channel.onmessage = (e) => {
          if (this.onTerminal) this.onTerminal(e.data);
        };
      } else if (channel.label === 'screen_feed') {
        channel.binaryType = 'arraybuffer';
        channel.onmessage = (e) => {
          if (this.onScreenFrame) this.onScreenFrame(e.data as ArrayBuffer);
        };
      }
    };

    this.rtc.onconnectionstatechange = () => {
      this.connected = this.rtc?.connectionState === 'connected';
      this.setStatus(this.connected ? 'Daemon Connected' : 'Disconnected');
    };

    await this.rtc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));
    const answer = await this.rtc.createAnswer();
    await this.rtc.setLocalDescription(answer);

    this.ws?.send(JSON.stringify({ type: 'answer', sdp: answer.sdp }));
  }

  sendCommand(command: string) {
    if (this.controlChannel?.readyState === 'open') {
      this.controlChannel.send(JSON.stringify({ type: 'command', command }));
    }
  }

  sendPermissionResponse(id: string, approved: boolean) {
    if (this.controlChannel?.readyState === 'open') {
      this.controlChannel.send(JSON.stringify({ type: 'permission_response', id, approved }));
    }
  }

  setStatus(status: string) {
    if (this.onStatusChange) this.onStatusChange(status);
  }

  disconnect() {
    this.rtc?.close();
    this.ws?.close();
    this.connected = false;
  }
}
