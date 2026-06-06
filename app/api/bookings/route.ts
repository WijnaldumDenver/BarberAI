import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/constants";
import { bookingSchema, bookingUpdateSchema } from "@/lib/validations";
import type { ApiError, ApiSuccess } from "@/lib/types";

export const runtime = "edge";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiError>({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "client") {
    return NextResponse.json<ApiError>({ error: "Only clients can create bookings" }, { status: 403 });
  }

  const monthlyLimit = PLAN_LIMITS[profile.plan as keyof typeof PLAN_LIMITS].bookingsPerMonth;
  if (monthlyLimit !== Infinity) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("client_id", user.id)
      .neq("status", "cancelled")
      .gte("created_at", startOfMonth.toISOString());

    if ((count ?? 0) >= monthlyLimit) {
      return NextResponse.json<ApiError>(
        { error: `Free plan allows ${monthlyLimit} bookings per month. Upgrade to Pro for unlimited.` },
        { status: 429 }
      );
    }
  }

  const { barberId, serviceId, scheduledAt, notes, aiRecommendation } = parsed.data;

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      client_id: user.id,
      barber_id: barberId,
      service_id: serviceId,
      scheduled_at: scheduledAt,
      notes: notes ?? null,
      ai_recommendation: aiRecommendation ?? null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json<ApiError>({ error: error.message }, { status: 500 });
  }

  return NextResponse.json<ApiSuccess<typeof booking>>({ data: booking }, { status: 201 });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bookingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiError>({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { id, status } = parsed.data;

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, barbers(user_id)")
    .eq("id", id)
    .single();

  if (!booking) {
    return NextResponse.json<ApiError>({ error: "Booking not found" }, { status: 404 });
  }

  const isClient = booking.client_id === user.id;
  const isBarber = (booking.barbers as { user_id: string })?.user_id === user.id;

  if (!isClient && !isBarber) {
    return NextResponse.json<ApiError>({ error: "Forbidden" }, { status: 403 });
  }

  const { data: updated, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json<ApiError>({ error: error.message }, { status: 500 });
  }

  return NextResponse.json<ApiSuccess<typeof updated>>({ data: updated });
}
