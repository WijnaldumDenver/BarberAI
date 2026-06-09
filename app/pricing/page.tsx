import Link from "next/link";
import { Check } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PRO_PRICE_MONTHLY } from "@/lib/constants";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";

const freeFeatures = [
  "3 bookings per month",
  "5 AI consultations per day",
  "Basic profile",
];

const proFeatures = [
  "Unlimited bookings",
  "50 AI consultations per day",
  "Priority listing",
  "Custom branding",
];

export default function PricingPage({
  searchParams,
}: {
  searchParams?: { reason?: string };
}) {
  const hitAiLimit = searchParams?.reason === "ai-limit";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        {hitAiLimit && (
          <div className="max-w-4xl mx-auto mb-8 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm">
            You&apos;ve used all your AI consultations for today. Upgrade to Pro for 50 per day.
          </div>
        )}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-muted-foreground">Start free. Upgrade when you&apos;re ready to grow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>For clients getting started</CardDescription>
              <p className="text-4xl font-bold mt-4">$0<span className="text-base font-normal text-muted-foreground">/month</span></p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/signup">Get started free</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For barbers who want to grow</CardDescription>
              <p className="text-4xl font-bold mt-4">
                ${PRO_PRICE_MONTHLY}
                <span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <CheckoutButton />
            </CardFooter>
          </Card>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
          Stripe test mode only — no real charges are processed.
        </p>
      </main>
      <Footer />
    </div>
  );
}
