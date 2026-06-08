import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ServicesManager } from "@/components/barber/ServicesManager";
import { createClient } from "@/lib/supabase/server";

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: barber } = await supabase
    .from("barbers")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("barber_id", barber?.id ?? "")
    .eq("is_active", true)
    .order("name");

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Manage services</h1>
        <p className="text-muted-foreground mb-8">Add and manage the services you offer.</p>
        <ServicesManager services={services ?? []} />
      </div>
    </DashboardLayout>
  );
}
