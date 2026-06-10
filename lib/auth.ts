import type { UserRole } from "@/lib/types";

export function getDashboardPath(role: UserRole): string {
  return role === "barber" ? "/dashboard/barber" : "/dashboard/client";
}
