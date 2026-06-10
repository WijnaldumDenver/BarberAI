import { BookingsKanban } from "@/components/barber/bookings/BookingsKanban";
import type { KanbanBooking, ServiceOption } from "@/components/barber/bookings/types";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/types";

function normalizeBooking(row: {
  id: string;
  scheduled_at: string;
  created_at: string;
  status: BookingStatus;
  notes: string | null;
  service_id: string;
  services: { name: string; price_cents: number; duration_minutes: number } | { name: string; price_cents: number; duration_minutes: number }[] | null;
  profiles: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null;
}): KanbanBooking {
  const service = Array.isArray(row.services) ? row.services[0] : row.services;
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

  return {
    id: row.id,
    scheduledAt: row.scheduled_at,
    createdAt: row.created_at,
    status: row.status,
    notes: row.notes,
    serviceId: row.service_id,
    serviceName: service?.name ?? "Service",
    priceCents: service?.price_cents ?? 0,
    durationMinutes: service?.duration_minutes ?? 0,
    clientName: profile?.full_name ?? "Client",
    clientEmail: profile?.email ?? null,
  };
}

export default async function BarberBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: barber } = await supabase
    .from("barbers")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  const barberId = barber?.id ?? "";

  const [{ data: bookings }, { data: services }] = await Promise.all([
    supabase
      .from("bookings")
      .select(`
        id,
        scheduled_at,
        created_at,
        status,
        notes,
        service_id,
        services(name, price_cents, duration_minutes),
        profiles!bookings_client_id_fkey(full_name, email)
      `)
      .eq("barber_id", barberId)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("services")
      .select("id, name")
      .eq("barber_id", barberId)
      .eq("is_active", true)
      .order("name"),
  ]);

  const kanbanBookings = (bookings ?? []).map((row) =>
    normalizeBooking(row as Parameters<typeof normalizeBooking>[0])
  );

  const serviceOptions: ServiceOption[] = (services ?? []).map((s) => ({
    id: s.id,
    name: s.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground mt-1">
          Drag appointments between columns to update their status. Finished cuts are hidden by default.
        </p>
      </div>
      <BookingsKanban initialBookings={kanbanBookings} services={serviceOptions} />
    </div>
  );
}
