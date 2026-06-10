"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { BookingStatus } from "@/lib/types";

interface BarberBookingActionsProps {
  bookingId: string;
  status: BookingStatus;
  onStatusChange?: (bookingId: string, status: BookingStatus) => void;
}

export function BarberBookingActions({ bookingId, status, onStatusChange }: BarberBookingActionsProps) {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (newStatus: BookingStatus) => {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Update failed");
      return newStatus;
    },
    onSuccess: (newStatus) => {
      toast({ title: "Booking updated" });
      onStatusChange?.(bookingId, newStatus);
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  if (status === "cancelled" || status === "completed") return null;

  return (
    <div className="flex gap-2">
      {status === "pending" && (
        <Button size="sm" onClick={() => mutation.mutate("confirmed")} disabled={mutation.isPending}>
          Confirm
        </Button>
      )}
      {(status === "pending" || status === "confirmed") && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => mutation.mutate("completed")}
            disabled={mutation.isPending}
          >
            Complete
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => mutation.mutate("cancelled")}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        </>
      )}
    </div>
  );
}
