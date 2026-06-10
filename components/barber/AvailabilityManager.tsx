"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { availabilitySchema, type AvailabilityInput } from "@/lib/validations";
import { DAY_NAMES } from "@/lib/constants";
import type { BarberAvailability } from "@/lib/types";

interface AvailabilityManagerProps {
  availability: BarberAvailability[];
}

export function AvailabilityManager({ availability }: AvailabilityManagerProps) {
  const { toast } = useToast();
  const [items, setItems] = useState(availability);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setItems(availability);
  }, [availability]);

  const form = useForm<AvailabilityInput>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AvailabilityInput) => {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to add availability");
      return json.data as BarberAvailability;
    },
    onSuccess: (slot) => {
      toast({ title: "Availability added" });
      form.reset({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" });
      setItems((prev) => [...prev, slot]);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      const res = await fetch(`/api/availability?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to remove availability");
      return id;
    },
    onSuccess: (id) => {
      toast({ title: "Availability removed" });
      setItems((prev) => prev.filter((s) => s.id !== id));
      setDeletingId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setDeletingId(null);
    },
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Add availability window</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <FormField control={form.control} name="dayOfWeek" render={({ field }) => (
                <FormItem>
                  <FormLabel>Day</FormLabel>
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DAY_NAMES.map((day, i) => (
                        <SelectItem key={day} value={String(i)}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="startTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="endTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>End time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>Add window</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Current schedule</h2>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No availability set. Add your working hours above.</p>
        ) : (
          items.map((slot) => (
            <Card key={slot.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{DAY_NAMES[slot.day_of_week]}</p>
                  <p className="text-sm text-muted-foreground">
                    {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(slot.id)}
                  disabled={deletingId === slot.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
