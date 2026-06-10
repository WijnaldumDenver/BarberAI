"use client";

import { useEffect, useState } from "react";
import { BookingCard } from "@/components/booking/BookingCard";
import { BarberBookingActions } from "@/components/barber/BarberBookingActions";
import type { BookingStatus } from "@/lib/types";

export interface TodayBooking {
  id: string;
  scheduled_at: string;
  status: BookingStatus;
  services: { name: string; price_cents: number } | null;
  profiles: { full_name: string | null } | null;
}

interface BarberTodayBookingsProps {
  bookings: TodayBooking[];
}

export function BarberTodayBookings({ bookings }: BarberTodayBookingsProps) {
  const [items, setItems] = useState(bookings);

  useEffect(() => {
    setItems(bookings);
  }, [bookings]);

  const handleStatusChange = (bookingId: string, status: BookingStatus) => {
    if (status === "cancelled") {
      setItems((prev) => prev.filter((b) => b.id !== bookingId));
      return;
    }
    setItems((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  };

  if (items.length === 0) {
    return <p className="text-muted-foreground">No bookings scheduled for today.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((booking) => (
        <div key={booking.id} className="space-y-2">
          <BookingCard
            id={booking.id}
            scheduledAt={booking.scheduled_at}
            status={booking.status}
            serviceName={booking.services?.name ?? "Service"}
            priceCents={booking.services?.price_cents ?? 0}
            clientName={booking.profiles?.full_name ?? "Client"}
            showBarber={false}
          />
          <BarberBookingActions
            bookingId={booking.id}
            status={booking.status}
            onStatusChange={handleStatusChange}
          />
        </div>
      ))}
    </div>
  );
}
