import Link from "next/link";
import { Scissors } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { getDashboardPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export async function Navbar() {
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
    <header className="sticky top-0 z-50 border-b border-border/60 surface-glass supports-[backdrop-filter]:bg-card/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
          <Scissors className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
          <span>
            Barber<span className="text-primary">AI</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {user && role === "client" && (
            <Link href="/barbers" className="text-muted-foreground hover:text-foreground transition-colors">
              Find a Barber
            </Link>
          )}
          {user && role === "barber" && (
            <Link
              href="/dashboard/barber/services"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              My services
            </Link>
          )}
          {!user && (
            <Link href="/barbers" className="text-muted-foreground hover:text-foreground transition-colors">
              Find a Barber
            </Link>
          )}
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Button asChild variant="outline">
                <Link href={dashboardPath}>Dashboard</Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
