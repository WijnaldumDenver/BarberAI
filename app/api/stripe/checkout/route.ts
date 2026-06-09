import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getAppUrl } from "@/lib/stripe";
import type { ApiError, ApiSuccess, CheckoutResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json<ApiError>({ error: "Profile not found" }, { status: 404 });
  }

  let stripeCustomerId = profile.stripe_customer_id;

  if (!stripeCustomerId) {
    const customer = await getStripe().customers.create({
      email: profile.email,
      metadata: { supabase_user_id: user.id },
    });
    stripeCustomerId = customer.id;

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", user.id);
  }

  const baseUrl = getAppUrl();

  const session = await getStripe().checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/barber?upgraded=true`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: { supabase_user_id: user.id },
  });

  if (!session.url) {
    return NextResponse.json<ApiError>({ error: "Failed to create checkout session" }, { status: 500 });
  }

  return NextResponse.json<ApiSuccess<CheckoutResponse>>({ data: { url: session.url } });
}
