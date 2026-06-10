import Link from "next/link";
import { BarberTodayBookings } from "@/components/barber/BarberTodayBookings";
import { UpgradeSuccessBanner } from "@/components/barber/UpgradeSuccessBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getWeekBounds } from "@/lib/booking-slots";
import { formatPrice } from "@/lib/utils";

export default async function BarberDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user!.id)
    .single();

  const { data: barber } = await supabase
    .from("barbers")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data: todayBookings } = await supabase
    .from("bookings")
    .select(`
      id,
      scheduled_at,
      status,
      services(name, price_cents),
      profiles!bookings_client_id_fkey(full_name)
    `)
    .eq("barber_id", barber?.id ?? "")
    .gte("scheduled_at", todayStart.toISOString())
    .lte("scheduled_at", todayEnd.toISOString())
    .neq("status", "cancelled")
    .order("scheduled_at", { ascending: true });

  const { start, end } = getWeekBounds();

  const { data: weekBookings } = await supabase
    .from("bookings")
    .select("*, services(price_cents)")
    .eq("barber_id", barber?.id ?? "")
    .gte("scheduled_at", start.toISOString())
    .lte("scheduled_at", end.toISOString())
    .neq("status", "cancelled");

  const weekCount = weekBookings?.length ?? 0;
  const weekRevenue = (weekBookings ?? [])
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + ((b.services as { price_cents: number })?.price_cents ?? 0), 0);

  return (
    <div className="space-y-8">
      <UpgradeSuccessBanner show={params.upgraded === "true"} />

      {profile?.plan === "free" && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Upgrade to Pro</p>
            <p className="text-sm text-muted-foreground">Get priority listing and unlimited bookings for clients.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/barber/upgrade">Upgrade</Link>
          </Button>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold">Barber dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your appointments and services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bookings this week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{weekCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue this week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatPrice(weekRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Today&apos;s bookings</h2>
        <BarberTodayBookings
          bookings={(todayBookings ?? []).map((booking) => {
            const services = Array.isArray(booking.services)
              ? booking.services[0]
              : booking.services;
            const profiles = Array.isArray(booking.profiles)
              ? booking.profiles[0]
              : booking.profiles;

            return {
              id: booking.id,
              scheduled_at: booking.scheduled_at,
              status: booking.status,
              services: services as { name: string; price_cents: number } | null,
              profiles: profiles as { full_name: string | null } | null,
            };
          })}
        />
      </div>

      <Button variant="outline" asChild>
        <Link href="/dashboard/barber/services">Manage services</Link>
      </Button>
    </div>
  );
}
