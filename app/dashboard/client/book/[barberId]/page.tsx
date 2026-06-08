import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BookingForm } from "@/components/booking/BookingForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";

interface BookBarberPageProps {
  params: Promise<{ barberId: string }>;
}

export default async function BookBarberPage({ params }: BookBarberPageProps) {
  const { barberId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: barber } = await supabase
    .from("barbers")
    .select(`
      *,
      profiles!barbers_user_id_fkey(full_name, avatar_url)
    `)
    .eq("id", barberId)
    .eq("is_active", true)
    .single();

  if (!barber) notFound();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("barber_id", barberId)
    .eq("is_active", true);

  const { data: availability } = await supabase
    .from("barber_availability")
    .select("*")
    .eq("barber_id", barberId);

  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("barber_id", barberId)
    .neq("status", "cancelled");

  const { data: consultations } = await supabase
    .from("ai_consultations")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const profile = barber.profiles as { full_name: string | null; avatar_url: string | null } | null;
  const initials = barber.shop_name.slice(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-16 w-16">
            <AvatarImage src={barber.avatar_url ?? profile?.avatar_url ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{barber.shop_name}</h1>
            {barber.location && (
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {barber.location}
              </p>
            )}
            {barber.bio && <p className="text-sm text-muted-foreground mt-1">{barber.bio}</p>}
          </div>
        </div>

        {!services || services.length === 0 ? (
          <p className="text-muted-foreground">This barber has no services available yet.</p>
        ) : (
          <BookingForm
            barberId={barberId}
            services={services}
            availability={availability ?? []}
            existingBookings={existingBookings ?? []}
            consultations={consultations ?? []}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
