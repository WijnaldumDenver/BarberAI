import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getAiServiceErrorMessage,
  getStyleConsultation,
  parseRecommendedBarberId,
  type BarberConsultContext,
} from "@/lib/gemini";
import { PLAN_LIMITS } from "@/lib/constants";
import { consultSchema } from "@/lib/validations";
import type { ApiError, ApiSuccess, ConsultResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = consultSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiError>({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, ai_requests_today, ai_requests_reset_at")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json<ApiError>({ error: "Profile not found" }, { status: 404 });
  }

  const limit = PLAN_LIMITS[profile.plan as keyof typeof PLAN_LIMITS].aiPerDay;
  const today = new Date().toISOString().split("T")[0];
  let requestsToday = profile.ai_requests_today;

  if (profile.ai_requests_reset_at < today) {
    requestsToday = 0;
    await supabase
      .from("profiles")
      .update({ ai_requests_today: 0, ai_requests_reset_at: today })
      .eq("id", user.id);
  }

  if (requestsToday >= limit) {
    return NextResponse.json<ApiError>(
      { error: "Daily limit reached", code: "LIMIT_REACHED" },
      { status: 429 }
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json<ApiError>(
      { error: "AI service is not configured. Please contact support." },
      { status: 503 }
    );
  }

  const { desiredStyle, faceShape, occasion } = parsed.data;
  let userPrompt = `Desired style: ${desiredStyle}`;
  if (faceShape) userPrompt += `\nFace shape: ${faceShape}`;
  if (occasion) userPrompt += `\nOccasion: ${occasion}`;

  const { data: barbers } = await supabase
    .from("barbers")
    .select(`
      id,
      shop_name,
      bio,
      location,
      profiles!barbers_user_id_fkey(full_name),
      services(name, description, is_active)
    `)
    .eq("is_active", true);

  const barberContext: BarberConsultContext[] = (barbers ?? []).map((barber) => {
    const profile = Array.isArray(barber.profiles) ? barber.profiles[0] : barber.profiles;
    const services = Array.isArray(barber.services) ? barber.services : [];

    return {
      id: barber.id,
      shopName: barber.shop_name,
      barberName: (profile as { full_name: string | null } | null | undefined)?.full_name ?? null,
      bio: barber.bio,
      location: barber.location,
      services: services
        .filter((service) => service.is_active)
        .map((service) => ({ name: service.name, description: service.description })),
    };
  });

  try {
    const rawResponse = await getStyleConsultation(userPrompt, barberContext);
    const { text: response, barberId: recommendedBarberId } = parseRecommendedBarberId(rawResponse);
    const recommendedBarber = barberContext.find((barber) => barber.id === recommendedBarberId);

    const { data: consultation, error: insertError } = await supabase
      .from("ai_consultations")
      .insert({
        user_id: user.id,
        prompt: desiredStyle,
        response,
      })
      .select()
      .single();

    if (insertError || !consultation) {
      return NextResponse.json<ApiError>(
        { error: insertError?.message ?? "Failed to save consultation" },
        { status: 500 }
      );
    }

    await supabase
      .from("profiles")
      .update({ ai_requests_today: requestsToday + 1 })
      .eq("id", user.id);

    return NextResponse.json<ApiSuccess<ConsultResponse>>({
      data: {
        id: consultation.id,
        response,
        prompt: consultation.prompt,
        createdAt: consultation.created_at,
        remaining: limit - requestsToday - 1,
        recommendedBarberId: recommendedBarber?.id ?? null,
        recommendedBarberName: recommendedBarber?.shopName ?? null,
      },
    });
  } catch (error) {
    console.error("AI consultation error:", error);
    return NextResponse.json<ApiError>(
      { error: getAiServiceErrorMessage(error) },
      { status: 500 }
    );
  }
}
