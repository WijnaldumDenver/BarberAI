import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { createClient } from "@/lib/supabase/server";
import { PRO_PRICE_MONTHLY } from "@/lib/constants";

const proFeatures = [
  "Unlimited client bookings",
  "50 AI consultations per day",
  "Priority listing in search",
  "Custom branding on profile",
];

export default async function UpgradePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user!.id)
    .single();

  const isPro = profile?.plan === "pro";

  return (
    <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-2">Upgrade to Pro</h1>
        <p className="text-muted-foreground mb-8">
          Grow your barbershop with premium features.
        </p>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle>BarberAI Pro</CardTitle>
            <CardDescription>
              {isPro ? "You are on the Pro plan" : "Everything you need to grow"}
            </CardDescription>
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
            {isPro ? (
              <p className="text-sm text-muted-foreground w-full text-center">
                You&apos;re already on Pro. Thank you!
              </p>
            ) : (
              <CheckoutButton />
            )}
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Stripe test mode — use card 4242 4242 4242 4242
        </p>
    </div>
  );
}
