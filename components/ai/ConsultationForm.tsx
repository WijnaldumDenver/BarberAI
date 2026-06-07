"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { consultSchema, type ConsultInput } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import type { ConsultResponse } from "@/lib/types";

interface ConsultationFormProps {
  onResult: (result: ConsultResponse) => void;
  remaining: number;
}

export function ConsultationForm({ onResult, remaining }: ConsultationFormProps) {
  const { toast } = useToast();
  const form = useForm<ConsultInput>({
    resolver: zodResolver(consultSchema),
    defaultValues: { desiredStyle: "", faceShape: "", occasion: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: ConsultInput) => {
      const res = await fetch("/api/ai/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Consultation failed");
      return json.data as ConsultResponse;
    },
    onSuccess: (data) => {
      onResult(data);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Consultation failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Describe your ideal style</CardTitle>
        <p className="text-sm text-muted-foreground">
          You have {remaining} consultation{remaining !== 1 ? "s" : ""} left today
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField control={form.control} name="desiredStyle" render={({ field }) => (
              <FormItem>
                <FormLabel>Desired style</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="I want a modern fade with texture on top, something low maintenance..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="faceShape" render={({ field }) => (
              <FormItem>
                <FormLabel>Face shape (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. oval, round, square" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="occasion" render={({ field }) => (
              <FormItem>
                <FormLabel>Occasion (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. job interview, wedding" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={mutation.isPending || remaining <= 0}>
              {mutation.isPending ? "Getting advice..." : "Get AI advice"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
