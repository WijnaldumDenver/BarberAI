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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { serviceSchema, type ServiceInput } from "@/lib/validations";
import { formatPrice } from "@/lib/utils";
import type { Service } from "@/lib/types";

interface ServicesManagerProps {
  services: Service[];
}

export function ServicesManager({ services }: ServicesManagerProps) {
  const { toast } = useToast();
  const [items, setItems] = useState(services);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setItems(services);
  }, [services]);

  const form = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { name: "", description: "", durationMinutes: 30, priceCents: 2500 },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ServiceInput) => {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create service");
      return json.data as Service;
    },
    onSuccess: (service) => {
      toast({ title: "Service added" });
      form.reset();
      setItems((prev) => [...prev, service]);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to delete service");
      return id;
    },
    onSuccess: (id) => {
      toast({ title: "Service removed" });
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
          <CardTitle>Add a service</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="Haircut" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Classic haircut with styling" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="priceCents" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (cents)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" disabled={createMutation.isPending}>Add service</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your services</h2>
        {items.length === 0 ? (
          <p className="text-muted-foreground">No services yet. Add your first service above.</p>
        ) : (
          items.map((service) => (
            <Card key={service.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(service.price_cents)} · {service.duration_minutes} min
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(service.id)}
                  disabled={deletingId === service.id}
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
