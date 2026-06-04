import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BarberCard } from "@/components/barber/BarberCard";
import { createClient } from "@/lib/supabase/server";
import type { BarberWithProfile } from "@/lib/types";

export default async function BarbersPage() {
  const supabase = await createClient();
  const { data: barbers } = await supabase
    .from("barbers")
    .select(`
      *,
      profiles!barbers_user_id_fkey(full_name, plan, avatar_url),
      services(*)
    `)
    .eq("is_active", true);

  const sorted = ((barbers ?? []) as BarberWithProfile[]).sort((a, b) => {
    const aPro = a.profiles?.plan === "pro" ? 1 : 0;
    const bPro = b.profiles?.plan === "pro" ? 1 : 0;
    return bPro - aPro;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Find a barber</h1>
        <p className="text-muted-foreground mb-8">Browse our barbers and book your next appointment.</p>
        {sorted.length === 0 ? (
          <p className="text-muted-foreground">No barbers available yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((barber) => (
              <BarberCard key={barber.id} barber={barber} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
