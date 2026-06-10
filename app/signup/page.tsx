import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AuthForm } from "@/components/auth/AuthForm";
import { getDashboardPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

interface SignupPageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const defaultRole: UserRole = params.role === "barber" ? "barber" : "client";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role) {
      redirect(getDashboardPath(profile.role as UserRole));
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <AuthForm mode="signup" defaultRole={defaultRole} />
      </main>
    </div>
  );
}
