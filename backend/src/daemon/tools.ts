// backend/src/daemon/tools.ts
import { tool } from 'ai';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export const systemTools = {
  executeTerminal: tool({
    description: 'Execute a bash command on the local terminal. Returns stdout and stderr.',
    parameters: z.object({
      command: z.string().describe('The bash command to execute'),
      cwd: z.string().optional().describe('The current working directory (optional)'),
    }),
    execute: async ({ command, cwd }) => {
      try {
        const { stdout, stderr } = await execAsync(command, { cwd });
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
    execute: async ({ filepath }) => {
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
    execute: async ({ filepath, content }) => {
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
};
