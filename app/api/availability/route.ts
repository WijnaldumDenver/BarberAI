import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { availabilitySchema } from "@/lib/validations";
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
  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiError>({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { dayOfWeek, startTime, endTime } = parsed.data;

  const { data: slot, error } = await supabase
    .from("barber_availability")
    .insert({
      barber_id: barber.id,
      day_of_week: dayOfWeek,
      start_time: `${startTime}:00`,
      end_time: `${endTime}:00`,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json<ApiError>({ error: error.message }, { status: 500 });
  }

  return NextResponse.json<ApiSuccess<typeof slot>>({ data: slot }, { status: 201 });
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
    return NextResponse.json<ApiError>({ error: "Availability ID required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("barber_availability")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json<ApiError>({ error: error.message }, { status: 500 });
  }

  return NextResponse.json<ApiSuccess<{ success: boolean }>>({ data: { success: true } });
}
