"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Clock, Kanban, LayoutDashboard, Scissors, Sparkles, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

interface DashboardSidebarProps {
  role: UserRole;
}

const clientLinks = [
  { href: "/dashboard/client", label: "Overview", icon: LayoutDashboard },
  { href: "/barbers", label: "Book a Barber", icon: Calendar },
  { href: "/dashboard/client/consult", label: "AI Consultation", icon: Sparkles },
];

const barberLinks = [
  { href: "/dashboard/barber", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/barber/bookings", label: "Bookings", icon: Kanban },
  { href: "/dashboard/barber/services", label: "Services", icon: Wrench },
  { href: "/dashboard/barber/availability", label: "Availability", icon: Clock },
  { href: "/dashboard/barber/upgrade", label: "Upgrade", icon: Scissors },
];

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const links = role === "barber" ? barberLinks : clientLinks;

  return (
    <aside className="w-64 border-r border-border/60 bg-card/30 backdrop-blur-sm min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
