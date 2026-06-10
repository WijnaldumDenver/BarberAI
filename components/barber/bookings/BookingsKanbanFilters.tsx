"use client";

import { Filter, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  countActiveFilters,
  createDefaultBookingFilters,
  DEFAULT_KANBAN_STATUSES,
  KANBAN_STATUSES,
  type BookingFilters,
  type DatePreset,
  type SortOption,
} from "@/lib/booking-filters";
import type { BookingStatus } from "@/lib/types";
import type { ServiceOption } from "./types";

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Finished",
  cancelled: "Cancelled",
};

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom range" },
];

interface BookingsKanbanFiltersProps {
  filters: BookingFilters;
  services: ServiceOption[];
  onChange: (filters: BookingFilters) => void;
}

export function BookingsKanbanFilters({
  filters,
  services,
  onChange,
}: BookingsKanbanFiltersProps) {
  const activeCount = countActiveFilters(filters);

  const toggleStatus = (status: BookingStatus) => {
    const next = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onChange({ ...filters, statuses: next.length > 0 ? next : [status] });
  };

  const showFinished = filters.statuses.includes("completed");
  const showCancelled = filters.statuses.includes("cancelled");

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeCount}
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(createDefaultBookingFilters())}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="booking-search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="booking-search"
              placeholder="Client, service, notes..."
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Service</Label>
          <Select
            value={filters.serviceId}
            onValueChange={(serviceId) => onChange({ ...filters, serviceId })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date range</Label>
          <Select
            value={filters.datePreset}
            onValueChange={(datePreset) =>
              onChange({ ...filters, datePreset: datePreset as DatePreset })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_PRESETS.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sort by</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(sortBy) =>
              onChange({ ...filters, sortBy: sortBy as SortOption })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled_asc">Soonest appointment</SelectItem>
              <SelectItem value="scheduled_desc">Latest appointment</SelectItem>
              <SelectItem value="created_desc">Recently booked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filters.datePreset === "custom" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date-from">From</Label>
            <Input
              id="date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-to">To</Label>
            <Input
              id="date-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Status columns
        </Label>
        <div className="flex flex-wrap gap-2">
          {KANBAN_STATUSES.map((status) => (
            <Button
              key={status}
              type="button"
              size="sm"
              variant={filters.statuses.includes(status) ? "default" : "outline"}
              onClick={() => toggleStatus(status)}
            >
              {STATUS_LABELS[status]}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={showFinished ? "secondary" : "outline"}
            onClick={() => {
              const statuses = showFinished
                ? filters.statuses.filter((s) => s !== "completed")
                : [...new Set([...filters.statuses, "completed"])];
              onChange({
                ...filters,
                statuses: statuses.length > 0 ? statuses : [...DEFAULT_KANBAN_STATUSES],
              });
            }}
          >
            {showFinished ? "Hide" : "Show"} finished cuts
          </Button>
          <Button
            type="button"
            size="sm"
            variant={showCancelled ? "secondary" : "outline"}
            onClick={() => {
              const statuses = showCancelled
                ? filters.statuses.filter((s) => s !== "cancelled")
                : [...new Set([...filters.statuses, "cancelled"])];
              onChange({
                ...filters,
                statuses: statuses.length > 0 ? statuses : [...DEFAULT_KANBAN_STATUSES],
              });
            }}
          >
            {showCancelled ? "Hide" : "Show"} cancelled
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Default view hides finished and cancelled bookings. Drag cards between columns to update status.
        </p>
      </div>
    </div>
  );
}

export function BookingsFilterSummary({
  total,
  visible,
  filters,
}: {
  total: number;
  visible: number;
  filters: BookingFilters;
}) {
  return (
    <p className={cn("text-sm text-muted-foreground")}>
      Showing {visible} of {total} bookings
      {filters.datePreset !== "all" && " · filtered by date"}
      {filters.serviceId !== "all" && " · filtered by service"}
    </p>
  );
}
