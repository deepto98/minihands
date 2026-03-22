// @ts-nocheck
// backend/src/daemon/tools.ts
import { tool } from 'ai';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { mouse, keyboard, screen, Point, straightTo, Button, Key } from '@nut-tree-fork/nut-js';
import { confirm, isCancel } from '@clack/prompts';
import picocolors from 'picocolors';

const execAsync = promisify(exec);

export const systemTools = {
  executeTerminal: tool({
    description: 'Execute a bash command on the local terminal. Returns stdout and stderr.',
    parameters: z.object({
      command: z.string().describe('The bash command to execute'),
      cwd: z.string().describe('The current working directory (pass "." if standard)'),
    }),
    execute: async ({ command, cwd }: { command: string; cwd: string }): Promise<any> => {
      // Permission Interceptor / Watchdog
      const dangerousPatterns = ['rm ', 'sudo ', 'npm publish', 'mkfs', 'dd ', 'mv ', 'format'];
      const isDangerous = dangerousPatterns.some(p => command.toLowerCase().includes(p));
      
      if (isDangerous) {
        console.log(''); // Newline for visual separation
        const allowed = await confirm({
          message: picocolors.red(`🚨 [Watchdog] Agent wants to execute high-risk command:\n"${command}"\nAllow?`),
        });
        
        if (!allowed || isCancel(allowed)) {
          console.log(picocolors.yellow('[Watchdog] Command blocked. Notifying agent...'));
          return { success: false, error: 'User denied permission to run this command. Find an alternative approach or ask for clarification.' };
        }
      }

      try {
        const { stdout, stderr } = await execAsync(command, { cwd: cwd === '.' ? undefined : cwd });
        return { stdout, stderr, success: true };
      } catch (error: any) {
        return { stdout: error.stdout, stderr: error.stderr, error: error.message, success: false };
      }
    },
  }),
  readFile: tool({
    description: 'Read the contents of a local file. Returns the string content.',
    parameters: z.object({
      filepath: z.string().describe('The absolute or relative path to the file'),
    }),
    execute: async ({ filepath }: { filepath: string }): Promise<any> => {
      try {
        const content = await fs.readFile(filepath, 'utf8');
        return { content, success: true };
      } catch (error: any) {
        return { error: error.message, success: false };
      }
    },
  }),
  writeFile: tool({
    description: 'Write string content to a local file. Creates directories if they do not exist.',
    parameters: z.object({
      filepath: z.string().describe('The path to the file to create or overwrite'),
      content: z.string().describe('The string content to write'),
    }),
    execute: async ({ filepath, content }: { filepath: string; content: string }): Promise<any> => {
      try {
        // Ensure parent directory exists
        await fs.mkdir(path.dirname(filepath), { recursive: true });
        await fs.writeFile(filepath, content, 'utf8');
        return { success: true };
      } catch (error: any) {
        return { error: error.message, success: false };
      }
    },
  }),
  mouseMove: tool({
    description: 'Move the mouse to absolute screen coordinates (x, y). Use getScreenDimensions first if you do not know the screen size.',
    parameters: z.object({
      x: z.number().describe('The X coordinate'),
      y: z.number().describe('The Y coordinate'),
    }),
    execute: async ({ x, y }: { x: number; y: number }): Promise<any> => {
      try {
        await mouse.move(straightTo(new Point(x, y)));
        return { success: true, message: `Mouse moved to ${x}, ${y}` };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  mouseClick: tool({
    description: 'Click the mouse at its current location.',
    parameters: z.object({
      button: z.enum(['left', 'right', 'middle']).describe('Which button to click (default left)'),
      doubleClick: z.boolean().describe('Whether to perform a double click (usually false)'),
    }),
    execute: async ({ button, doubleClick }: { button: 'left'|'right'|'middle'; doubleClick: boolean }): Promise<any> => {
      try {
        const btn = button === 'right' ? Button.RIGHT : button === 'middle' ? Button.MIDDLE : Button.LEFT;
        if (doubleClick) {
          await mouse.doubleClick(btn);
        } else {
          await mouse.click(btn);
        }
        return { success: true, message: `Clicked ${button} button` };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  keyboardType: tool({
    description: 'Type a string of text using the keyboard. Good for typing into focused inputs.',
    parameters: z.object({
      textToType: z.string().describe('The string of text to type'),
    }),
    execute: async ({ textToType }: { textToType: string }): Promise<any> => {
      try {
        await keyboard.type(textToType);
        return { success: true, message: `Typed text` };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  keyboardPress: tool({
    description: 'Press a special key (e.g. ENTER, ESCAPE, TAB, BACKSPACE, SPACE).',
    parameters: z.object({
      keyName: z.enum(['ENTER', 'ESCAPE', 'TAB', 'BACKSPACE', 'SPACE']).describe('The key to press'),
    }),
    execute: async ({ keyName }: { keyName: 'ENTER'|'ESCAPE'|'TAB'|'BACKSPACE'|'SPACE' }): Promise<any> => {
      try {
        const key = Key[keyName as keyof typeof Key];
        await keyboard.pressKey(key);
        await keyboard.releaseKey(key);
        return { success: true, message: `Pressed ${keyName}` };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
  getScreenDimensions: tool({
    description: 'Get the main screen dimensions (width and height).',
    parameters: z.object({
      _dummy: z.boolean().describe('Pass true here. Ignored.'),
    }),
    execute: async (): Promise<any> => {
      try {
        const width = await screen.width();
        const height = await screen.height();
        return { success: true, width, height };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  }),
};
