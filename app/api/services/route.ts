import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { serviceSchema } from "@/lib/validations";
import type { ApiError, ApiSuccess } from "@/lib/types";

export const runtime = "edge";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: barber } = await supabase
    .from("barbers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!barber) {
    return NextResponse.json<ApiError>({ error: "Barber profile not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = serviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiError>({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, description, durationMinutes, priceCents } = parsed.data;

  const { data: service, error } = await supabase
    .from("services")
    .insert({
      barber_id: barber.id,
      name,
      description: description ?? null,
      duration_minutes: durationMinutes,
      price_cents: priceCents,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json<ApiError>({ error: error.message }, { status: 500 });
  }

  return NextResponse.json<ApiSuccess<typeof service>>({ data: service }, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json<ApiError>({ error: "Service ID required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("services")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json<ApiError>({ error: error.message }, { status: 500 });
  }

  return NextResponse.json<ApiSuccess<{ success: boolean }>>({ data: { success: true } });
}
