import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getDashboardPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export async function Footer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role: UserRole | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = (profile?.role as UserRole) ?? null;
  }

  const dashboardPath = role ? getDashboardPath(role) : "/dashboard";

  return (
    <footer className="border-t py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-2">BarberAI</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered barbershop booking and style consultation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {(!user || role === "client") && (
                <li><Link href="/barbers" className="hover:text-foreground">Find a Barber</Link></li>
              )}
              <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
              {!user && (
                <li><Link href="/signup?role=barber" className="hover:text-foreground">For Barbers</Link></li>
              )}
              {user && role === "barber" && (
                <li><Link href="/dashboard/barber/upgrade" className="hover:text-foreground">Upgrade to Pro</Link></li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Account</h4>
            {user ? (
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href={dashboardPath} className="hover:text-foreground">Dashboard</Link></li>
                <li>
                  <LogoutButton variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground" />
                </li>
              </ul>
            ) : (
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground">Log in</Link></li>
                <li><Link href="/signup" className="hover:text-foreground">Sign up</Link></li>
              </ul>
            )}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} BarberAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
