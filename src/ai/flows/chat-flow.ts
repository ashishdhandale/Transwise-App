
'use server';

/**
 * @fileOverview A simple AI chatbot flow for providing help.
 *
 * - chat - A function that takes a user message and returns a helpful response.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('The user\'s question or message.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The AI\'s helpful response.'),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(
  input: ChatInput
): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a helpful AI assistant for an application called Transwise, a transport management system.
Your goal is to assist users with their questions about the app.
The user said:
"{{message}}"

Provide a clear, concise, and helpful response. If you don't know the answer, say so.
`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await chatPrompt(input);
    return output!;
  }
);
