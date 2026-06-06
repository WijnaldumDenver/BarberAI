import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiError, ApiSuccess, BarberWithProfile } from "@/lib/types";

export const runtime = "edge";

export async function GET() {
  const supabase = await createClient();

  const { data: barbers, error } = await supabase
    .from("barbers")
    .select(`
      *,
      profiles!barbers_user_id_fkey(full_name, plan, avatar_url),
      services(*)
    `)
    .eq("is_active", true);

  if (error) {
    return NextResponse.json<ApiError>({ error: error.message }, { status: 500 });
  }

  const sorted = (barbers as BarberWithProfile[]).sort((a, b) => {
    const aPro = a.profiles?.plan === "pro" ? 1 : 0;
    const bPro = b.profiles?.plan === "pro" ? 1 : 0;
    return bPro - aPro;
  });

  return NextResponse.json<ApiSuccess<BarberWithProfile[]>>({ data: sorted });
}
