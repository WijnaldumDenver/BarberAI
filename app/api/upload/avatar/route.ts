import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadAvatar } from "@/lib/cloudinary";
import type { ApiError, ApiSuccess } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json<ApiError>({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json<ApiError>({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const url = await uploadAvatar(buffer, user.id);

    await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);

    const { data: barber } = await supabase
      .from("barbers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (barber) {
      await supabase.from("barbers").update({ avatar_url: url }).eq("id", barber.id);
    }

    return NextResponse.json<ApiSuccess<{ url: string }>>({ data: { url } });
  } catch {
    return NextResponse.json<ApiError>({ error: "Upload failed" }, { status: 500 });
  }
}
