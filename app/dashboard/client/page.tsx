import Link from "next/link";
import { Calendar, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BookingCard } from "@/components/booking/BookingCard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/constants";

export default async function ClientDashboardPage() {
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

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      services(name, price_cents),
      barbers(shop_name, profiles!barbers_user_id_fkey(full_name))
    `)
    .eq("client_id", user!.id)
    .gte("scheduled_at", new Date().toISOString())
    .neq("status", "cancelled")
    .order("scheduled_at", { ascending: true });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Your dashboard</h1>
          <p className="text-muted-foreground mt-1">
            You have {remaining} consultation{remaining !== 1 ? "s" : ""} left today
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/barbers">
              <Calendar className="h-4 w-4 mr-2" />
              Book a barber
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/client/consult">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Consultation
            </Link>
          </Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming bookings</h2>
          {!bookings || bookings.length === 0 ? (
            <p className="text-muted-foreground">No upcoming bookings. Find a barber to get started!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  id={booking.id}
                  scheduledAt={booking.scheduled_at}
                  status={booking.status}
                  serviceName={(booking.services as { name: string })?.name ?? "Service"}
                  priceCents={(booking.services as { price_cents: number })?.price_cents ?? 0}
                  barberName={
                    (booking.barbers as { shop_name: string })?.shop_name ?? "Barber"
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
