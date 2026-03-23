import { spawn, execSync, ChildProcess } from 'child_process';
import os from 'os';
import picocolors from 'picocolors';
import { confirm, isCancel } from '@clack/prompts';
import fs from 'fs';

let activeTunnelProcess: ChildProcess | null = null;

// Graceful shutdown listener for the active tunnel
const cleanupTunnel = () => {
  if (activeTunnelProcess && !activeTunnelProcess.killed) {
    // console.log(picocolors.gray('\n[Tunnel] Shutting down cloudflared...'));
    activeTunnelProcess.kill('SIGINT');
  }
};

process.on('SIGINT', cleanupTunnel);
process.on('SIGTERM', cleanupTunnel);
process.on('exit', cleanupTunnel);

export async function checkCloudflaredInstalled(): Promise<boolean> {
  try {
    execSync('which cloudflared', { stdio: 'ignore' });
    return true; // Installed
  } catch (e) {
    console.warn(picocolors.yellow(`\n[Tunnel] cloudflared is not installed.`));
    
    const platform = os.platform();
    
    if (platform === 'darwin') {
      const allowed = await confirm({
        message: picocolors.cyan(`Would you like to install it now via Homebrew?\n  Running: brew install cloudflare/cloudflare/cloudflared`),
      });
      if (allowed && !isCancel(allowed)) {
        try {
          console.log(picocolors.gray('[Tunnel] Installing via brew...'));
          execSync('brew install cloudflare/cloudflare/cloudflared', { stdio: 'inherit' });
          return true;
        } catch (err) {
          console.error(picocolors.red('[Tunnel] Installation failed. Please install manually.'));
          return false;
        }
      }
    } else if (platform === 'linux') {
      const allowed = await confirm({
        message: picocolors.cyan(`Would you like to download it now into /usr/local/bin?\n  (This requires sudo privileges)`),
      });
      if (allowed && !isCancel(allowed)) {
        try {
          console.log(picocolors.gray('[Tunnel] Downloading cloudflared binary via curl...'));
          const tempPath = '/tmp/cloudflared';
          execSync(`curl -L --output ${tempPath} https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64`, { stdio: 'inherit' });
          execSync(`chmod +x ${tempPath}`);
          console.log(picocolors.gray('[Tunnel] Please enter your password to move the binary to /usr/local/bin/'));
          execSync(`sudo mv ${tempPath} /usr/local/bin/cloudflared`, { stdio: 'inherit' });
          return true;
        } catch (err) {
          console.error(picocolors.red('[Tunnel] Installation failed. Please install manually: https://pkg.cloudflare.com/'));
          return false;
        }
      }
    } else {
       console.log(picocolors.yellow('[Tunnel] Please install cloudflared manually: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/'));
    }
    
    return false;
  }
}

export function startEphemeralTunnel(port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log(picocolors.gray(`[Tunnel] Requesting ephemeral tunnel for port ${port}...`));
    
    const child = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${port}`]);
    activeTunnelProcess = child;

    // cloudflared logs standard output to stderr
    child.stderr.on('data', (data) => {
      const log = data.toString();
      // Look for the trycloudflare URL
      const match = log.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match) {
        resolve(match[0]);
      }
    });

    child.on('error', (err) => {
      console.error(picocolors.red(`[Tunnel Error] Failed to start cloudflared: ${err.message}`));
      reject(err);
    });

    child.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        // Only log if it's an unexpected exit, not manual kill
        console.warn(picocolors.yellow(`[Tunnel] cloudflared process exited with code ${code}`));
      }
      if (activeTunnelProcess === child) {
         activeTunnelProcess = null;
      }
    });

    // Timeout if we don't get a URL after 15 seconds
    setTimeout(() => {
      reject(new Error('Tunnel creation timed out after 15 seconds.'));
    }, 15000);
  });
}

export function startPersistentTunnel(tunnelId: string): void {
  console.log(picocolors.gray(`[Tunnel] Starting persistent tunnel: ${tunnelId}`));
  const child = spawn('cloudflared', ['tunnel', 'run', tunnelId], {
    stdio: 'ignore' // We don't need to parse URL for persistent tunnels
  });
  
  activeTunnelProcess = child;

  child.on('error', (err) => {
    console.error(picocolors.red(`[Tunnel Error] Failed to start cloudflared: ${err.message}`));
  });

  child.on('exit', (code) => {
    if (activeTunnelProcess === child) {
        activeTunnelProcess = null;
    }
  });
}
