import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getDashboardPath } from "@/lib/auth";
import type { UserRole } from "@/lib/types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  let role: UserRole | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    role = (profile?.role as UserRole) ?? null;

    supabaseResponse.headers.set("x-user-id", user.id);
    supabaseResponse.headers.set("x-user-email", user.email ?? "");
    if (role) {
      supabaseResponse.headers.set("x-user-role", role);
    }
  }

  if (user && role && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = getDashboardPath(role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && role) {
    if (pathname.startsWith("/dashboard/client") && role === "barber") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/barber";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/dashboard/barber") && role === "client") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/client";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
