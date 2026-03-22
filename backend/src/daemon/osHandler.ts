import os from 'os';
import { execSync } from 'child_process';
import picocolors from 'picocolors';
import { mouse } from '@nut-tree-fork/nut-js';

export async function checkOSDependencies() {
  const platform = os.platform();

  if (platform === 'linux') {
    try {
      // screenshot-desktop on Linux relies strictly on scrot or gnome-screenshot.
      // We will ensure `scrot` is explicitly installed to guarantee capturing works.
      execSync('which scrot', { stdio: 'ignore' });
    } catch (e) {
      console.error(picocolors.red('\n[Daemon Error] Critical System Dependency Missing.'));
      console.log(picocolors.yellow('The "scrot" package is required for high-performance screen capturing on Linux.'));
      console.log(picocolors.cyan('\nPlease install it by running:\n  sudo apt-get install scrot\n'));
      process.exit(1);
    }
  }

  if (platform === 'darwin') {
    try {
      // This will instantly trigger the macOS Accessibility prompt if missing,
      // and typically throws an error if explicitly denied or running strictly.
      await mouse.getPosition();
    } catch (e: any) {
      console.error(picocolors.red(`\n[Daemon Error] Missing macOS Privacy Permissions: ${e?.message || 'Access Denied'}`));
      console.log(picocolors.yellow('\nTo remote-control this Mac, you must manually grant permissions:'));
      console.log(picocolors.gray('1. Open System Settings > Privacy & Security'));
      console.log(picocolors.gray('2. Navigate to "Accessibility" and enable your terminal (e.g. iTerm, VSCode)'));
      console.log(picocolors.gray('3. Navigate to "Screen Recording" and enable your terminal'));
      console.log(picocolors.yellow('\nPlease restart the application after granting access.\n'));
      process.exit(1);
    }
  }
}
