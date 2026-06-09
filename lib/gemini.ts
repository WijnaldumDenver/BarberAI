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
Keep every response under 120 words. Be direct — no filler, no long lists.

Use exactly these markdown sections:

## Style tip
1-2 short sentences on the best cut or approach.

## Best barber for you
Recommend ONE barber from the provided list using their exact shop name.
Explain in 1-2 sentences why they are the best match (specialty, services, bio).
If no barbers are listed, say they can browse barbers on the site and skip the ID line below.

## Tell your barber
One short sentence the client can quote at the chair.

After the sections, on its own final line, output:
RECOMMENDED_BARBER_ID: <barber id from the list, or "none">`;

export interface BarberConsultContext {
  id: string;
  shopName: string;
  barberName: string | null;
  bio: string | null;
  location: string | null;
  services: Array<{ name: string; description: string | null }>;
}

export function formatBarbersForPrompt(barbers: BarberConsultContext[]): string {
  if (barbers.length === 0) {
    return "Available barbers: none listed.";
  }

  const lines = barbers.map((barber) => {
    const services = barber.services
      .map((s) => {
        const desc = s.description ? ` — ${s.description}` : "";
        return `${s.name}${desc}`;
      })
      .join("; ");

    return [
      `- ID: ${barber.id}`,
      `  Shop: ${barber.shopName}`,
      barber.barberName ? `  Barber: ${barber.barberName}` : null,
      barber.location ? `  Location: ${barber.location}` : null,
      barber.bio ? `  Bio: ${barber.bio}` : null,
      services ? `  Services: ${services}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  });

  return `Available barbers:\n${lines.join("\n")}`;
}

export function parseRecommendedBarberId(response: string): {
  text: string;
  barberId: string | null;
} {
  const match = response.match(/RECOMMENDED_BARBER_ID:\s*([a-f0-9-]+|none)\s*$/im);
  if (!match) {
    return { text: response.trim(), barberId: null };
  }

  const barberId = match[1].toLowerCase() === "none" ? null : match[1];
  const text = response.replace(/\n?RECOMMENDED_BARBER_ID:\s*(?:[a-f0-9-]+|none)\s*$/im, "").trim();

  return { text, barberId };
}

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
    message.includes("rate limit") ||
    message.includes("UNAVAILABLE") ||
    message.includes("high demand")
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

  if (message.includes("Empty response from Gemini")) {
    return "AI service returned an empty response. Please try again.";
  }

  return "AI consultation failed. Please try again later.";
}

function extractResponseText(
  response: Awaited<ReturnType<GoogleGenAI["models"]["generateContent"]>>
): string {
  const text = response.text?.trim();
  if (text) return text;

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const fromParts = parts
    .map((part) => ("text" in part ? part.text : undefined))
    .filter((value): value is string => Boolean(value))
    .join("")
    .trim();

  return fromParts;
}

export async function getStyleConsultation(
  userPrompt: string,
  barberContext: BarberConsultContext[]
): Promise<string> {
  const fullPrompt = `${userPrompt}\n\n${formatBarbersForPrompt(barberContext)}`;

  const response = await getGemini().models.generateContent({
    model: GEMINI_MODEL,
    contents: fullPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      maxOutputTokens: 512,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const text = extractResponseText(response);
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  return text;
}
