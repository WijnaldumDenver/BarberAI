import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { BookingStatus, KanbanBooking } from "@/lib/types";

export const KANBAN_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export const DEFAULT_KANBAN_STATUSES: BookingStatus[] = ["pending", "confirmed"];

export type DatePreset = "all" | "today" | "week" | "month" | "custom";
export type SortOption = "scheduled_asc" | "scheduled_desc" | "created_desc";

export interface BookingFilters {
  search: string;
  serviceId: string;
  datePreset: DatePreset;
  dateFrom: string;
  dateTo: string;
  statuses: BookingStatus[];
  sortBy: SortOption;
}

export function createDefaultBookingFilters(): BookingFilters {
  return {
    search: "",
    serviceId: "all",
    datePreset: "all",
    dateFrom: "",
    dateTo: "",
    statuses: [...DEFAULT_KANBAN_STATUSES],
    sortBy: "scheduled_asc",
  };
}

function getDateRange(filters: BookingFilters): { start: Date; end: Date } | null {
  const now = new Date();

  switch (filters.datePreset) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "custom": {
      if (!filters.dateFrom && !filters.dateTo) return null;
      const start = filters.dateFrom ? startOfDay(new Date(filters.dateFrom)) : new Date(0);
      const end = filters.dateTo ? endOfDay(new Date(filters.dateTo)) : new Date(8640000000000000);
      return { start, end };
    }
    default:
      return null;
  }
}

export function filterKanbanBookings(
  bookings: KanbanBooking[],
  filters: BookingFilters
): KanbanBooking[] {
  let result = bookings.filter((b) => filters.statuses.includes(b.status));

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (b) =>
        b.clientName?.toLowerCase().includes(q) ||
        b.clientEmail?.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q) ||
        b.notes?.toLowerCase().includes(q)
    );
  }

  if (filters.serviceId !== "all") {
    result = result.filter((b) => b.serviceId === filters.serviceId);
  }

  const range = getDateRange(filters);
  if (range) {
    result = result.filter((b) =>
      isWithinInterval(new Date(b.scheduledAt), range)
    );
  }

  result.sort((a, b) => {
    switch (filters.sortBy) {
      case "scheduled_desc":
        return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime();
      case "created_desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    }
  });

  return result;
}

export function countActiveFilters(filters: BookingFilters): number {
  let count = 0;
  if (filters.search.trim()) count++;
  if (filters.serviceId !== "all") count++;
  if (filters.datePreset !== "all") count++;
  if (filters.sortBy !== "scheduled_asc") count++;

  const defaultSet = new Set(DEFAULT_KANBAN_STATUSES);
  const hasNonDefaultStatuses =
    filters.statuses.length !== DEFAULT_KANBAN_STATUSES.length ||
    filters.statuses.some((s) => !defaultSet.has(s));

  if (hasNonDefaultStatuses) count++;
  return count;
}
