import { generateText, tool } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';

const myTools = {
  executeTerminal: tool({
    description: 'Execute a bash command on the local terminal.',
    parameters: z.object({
      command: z.string(),
    }),
    execute: async ({ command }) => {
      return { stdout: "test", success: true };
    },
  }),
};

async function testZod() {
  console.log("Testing z.object without .describe()...");
  try {
    const res = await generateText({
      model: openai('gpt-4o') as any,
      prompt: "Execute ls",
      tools: myTools,
    });
    console.log("SUCCESS:", res.text);
  } catch (err: any) {
    console.error("ERROR:", err.message);
  }
}

testZod();
