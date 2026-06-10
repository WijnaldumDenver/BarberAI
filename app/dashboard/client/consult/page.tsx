import { redirect } from "next/navigation";
import { ConsultPageClient } from "@/components/ai/ConsultPageClient";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/constants";

export default async function ConsultPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, ai_requests_today, ai_requests_reset_at")
    .eq("id", user!.id)
    .single();

  const today = new Date().toISOString().split("T")[0];
  const requestsToday =
    profile?.ai_requests_reset_at && profile.ai_requests_reset_at < today
      ? 0
      : (profile?.ai_requests_today ?? 0);

  const limit = PLAN_LIMITS[(profile?.plan ?? "free") as keyof typeof PLAN_LIMITS].aiPerDay;
  const remaining = Math.max(0, limit - requestsToday);

  if (remaining <= 0) {
    redirect("/pricing?reason=ai-limit");
  }

  const { data: consultations } = await supabase
    .from("ai_consultations")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">AI Style Consultation</h1>
      <p className="text-muted-foreground mb-8">
        Describe your ideal look and get personalized advice before your appointment.
      </p>
      <ConsultPageClient remaining={remaining} consultations={consultations ?? []} />
    </div>
  );
}
