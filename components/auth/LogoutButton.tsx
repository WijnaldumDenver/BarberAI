"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LogoutButton({ variant = "ghost", size = "default", className }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Button variant={variant} size={size} className={className} onClick={handleLogout}>
      Log out
    </Button>
  );
}
