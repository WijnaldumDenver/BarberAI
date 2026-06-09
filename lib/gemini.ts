import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL } from "./constants";

let geminiInstance: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!geminiInstance) {
    geminiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return geminiInstance;
}

export const SYSTEM_PROMPT = `You are BarberAI, an expert hair style consultant for barbershops.
Give practical, specific advice. Always end with a "What to tell your barber" section
with exact wording the client can use. Keep responses under 300 words.
Format with clear sections using markdown.`;

export function getAiServiceErrorMessage(error: unknown): string {
  if (!process.env.GEMINI_API_KEY) {
    return "AI service is not configured. Please contact support.";
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "";

  if (
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("quota") ||
    message.includes("rate limit")
  ) {
    return "AI service is temporarily unavailable. Please try again later.";
  }

  if (
    message.includes("API_KEY_INVALID") ||
    message.includes("API key not valid") ||
    message.includes("PERMISSION_DENIED")
  ) {
    return "AI service is not configured correctly. Please contact support.";
  }

  return "AI consultation failed. Please try again later.";
}

export async function getStyleConsultation(userPrompt: string): Promise<string> {
  const response = await getGemini().models.generateContent({
    model: GEMINI_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 500,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  return text;
}
