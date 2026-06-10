"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import type { AiConsultation, BarberAvailability, Booking, Service } from "@/lib/types";
import { generateTimeSlots } from "@/lib/booking-slots";

interface BookingFormProps {
  barberId: string;
  services: Service[];
  availability: BarberAvailability[];
  existingBookings: Booking[];
  consultations: AiConsultation[];
}

export function BookingForm({
  barberId,
  services,
  availability,
  existingBookings,
  consultations,
}: BookingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id ?? "");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState("");

  const selectedService = services.find((s) => s.id === selectedServiceId);

  const slots = selectedService && selectedDate
    ? generateTimeSlots(selectedDate, availability, existingBookings, selectedService.duration_minutes)
    : [];

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedService || !selectedDate || !selectedTime) {
        throw new Error("Please select a service, date, and time");
      }

      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId,
          serviceId: selectedServiceId,
          scheduledAt: scheduledAt.toISOString(),
          notes: notes || undefined,
          aiRecommendation: aiRecommendation || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");
      return data;
    },
    onSuccess: () => {
      toast({ title: "Booking confirmed!", description: "Your appointment has been scheduled." });
      router.push("/dashboard/client");
    },
    onError: (error: Error) => {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select a service</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} — {formatPrice(service.price_cents)} ({service.duration_minutes} min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pick a date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Available times — {format(selectedDate, "MMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No available slots for this date.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.filter((s) => s.available).map((slot) => (
                  <Button
                    key={slot.time}
                    type="button"
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(slot.time)}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Additional details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">Anything to tell your barber?</Label>
            <Textarea
              id="notes"
              placeholder="e.g. I prefer a low fade on the sides..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
            />
          </div>
          {consultations.length > 0 && (
            <div>
              <Label>Attach AI consultation (optional)</Label>
              <Select value={aiRecommendation} onValueChange={setAiRecommendation}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a past consultation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {consultations.map((c) => (
                    <SelectItem key={c.id} value={c.response}>
                      {c.prompt.slice(0, 50)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        disabled={!selectedServiceId || !selectedTime || bookingMutation.isPending}
        onClick={() => bookingMutation.mutate()}
      >
        {bookingMutation.isPending ? "Booking..." : "Confirm booking"}
      </Button>
    </div>
  );
}

export function BookingFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
