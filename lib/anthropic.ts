import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "./constants";

let anthropicInstance: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!anthropicInstance) {
    anthropicInstance = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicInstance;
}

export const SYSTEM_PROMPT = `You are BarberAI, an expert hair style consultant for barbershops.
Give practical, specific advice. Always end with a "What to tell your barber" section
with exact wording the client can use. Keep responses under 300 words.
Format with clear sections using markdown.`;

export async function getStyleConsultation(userPrompt: string): Promise<string> {
  const message = await getAnthropic().messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }
  return block.text;
}
