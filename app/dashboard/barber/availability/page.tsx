import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AvailabilityManager } from "@/components/barber/AvailabilityManager";
import { createClient } from "@/lib/supabase/server";

export default async function AvailabilityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: barber } = await supabase
    .from("barbers")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  const { data: availability } = await supabase
    .from("barber_availability")
    .select("*")
    .eq("barber_id", barber?.id ?? "")
    .order("day_of_week")
    .order("start_time");

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Set availability</h1>
        <p className="text-muted-foreground mb-8">
          Define when clients can book appointments with you.
        </p>
        <AvailabilityManager availability={availability ?? []} />
      </div>
    </DashboardLayout>
  );
}
