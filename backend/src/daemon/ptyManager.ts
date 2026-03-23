import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import os from 'os';
import picocolors from 'picocolors';

let ptyProcess: ChildProcessWithoutNullStreams | null = null;
let outputHandler: ((data: string) => void) | null = null;

export function startPty(onData: (data: string) => void) {
  if (ptyProcess && !ptyProcess.killed) {
    ptyProcess.kill();
  }

  outputHandler = onData;
  const shell = os.platform() === 'win32' ? 'cmd.exe' : 'bash';
  
  // Start an interactive bash shell / cmd.
  // Note: child_process.spawn doesn't provide a true TTY on Linux, 
  // but it's lightweight and works for basic commands as requested for the all-in-one package.
  ptyProcess = spawn(shell, os.platform() !== 'win32' ? ['-i'] : [], {
    env: { ...process.env, TERM: 'xterm-256color' },
  });

  ptyProcess.stdout.on('data', (data) => {
    if (outputHandler) outputHandler(data.toString());
  });

  ptyProcess.stderr.on('data', (data) => {
    if (outputHandler) outputHandler(data.toString());
  });

  ptyProcess.on('exit', () => {
    if (outputHandler) {
      outputHandler('\r\n[Process exited]\r\n');
    }
  });

  console.log(picocolors.gray(`[PTY] Started virtual shell (${shell}) PID: ${ptyProcess.pid}`));
}

export function writePty(data: string) {
  if (ptyProcess && !ptyProcess.killed && ptyProcess.stdin) {
    ptyProcess.stdin.write(data);
  }
}

export function stopPty() {
  if (ptyProcess && !ptyProcess.killed) {
    console.log(picocolors.gray(`[PTY] Killing shell PID: ${ptyProcess.pid}`));
    ptyProcess.kill();
    ptyProcess = null;
  }
}

// User strict rule: We MUST attach exit handlers to kill child_processes
function killPtyProcess() {
  if (ptyProcess && !ptyProcess.killed) {
    ptyProcess.kill('SIGKILL');
  }
}

process.on('exit', killPtyProcess);
process.on('SIGINT', () => { killPtyProcess(); process.exit(0); });
process.on('SIGTERM', () => { killPtyProcess(); process.exit(0); });
