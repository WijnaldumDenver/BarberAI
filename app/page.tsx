import Link from "next/link";
import { Calendar, Scissors, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BarberCard } from "@/components/barber/BarberCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { BarberWithProfile } from "@/lib/types";

const features = [
  {
    icon: Calendar,
    title: "Smart booking",
    description: "Book appointments with your favorite barbers in just a few clicks.",
  },
  {
    icon: Sparkles,
    title: "AI consultation",
    description: "Get personalized style recommendations before you sit in the chair.",
  },
  {
    icon: Scissors,
    title: "Barber profiles",
    description: "Browse barber profiles, services, and reviews all in one place.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: barbers } = await supabase
    .from("barbers")
    .select(`
      *,
      profiles!barbers_user_id_fkey(full_name, plan, avatar_url),
      services(*)
    `)
    .eq("is_active", true)
    .limit(3);

  const featuredBarbers = (barbers ?? []) as BarberWithProfile[];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Book your next cut.
            <br />
            <span className="text-muted-foreground">Get AI style advice before you sit down.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            BarberAI connects you with top barbers and gives you AI-powered style recommendations
            so you walk in confident.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/barbers">Find a barber</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup?role=barber">I&apos;m a barber</Link>
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why BarberAI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <Icon className="h-10 w-10 mb-2" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {featuredBarbers.length > 0 && (
          <section className="container mx-auto px-4 py-16 bg-muted/30">
            <h2 className="text-3xl font-bold text-center mb-12">Featured barbers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredBarbers.map((barber) => (
                <BarberCard key={barber.id} barber={barber} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
