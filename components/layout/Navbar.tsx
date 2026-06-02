import Link from "next/link";
import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Scissors className="h-6 w-6" />
          BarberAI
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/barbers" className="text-muted-foreground hover:text-foreground transition-colors">
            Find a Barber
          </Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
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
