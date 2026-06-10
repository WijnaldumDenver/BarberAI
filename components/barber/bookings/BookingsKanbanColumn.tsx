"use client";

import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";
import { BookingsKanbanCard } from "./BookingsKanbanCard";
import type { KanbanBooking } from "./types";

const COLUMN_META: Record<
  BookingStatus,
  { label: string; description: string; accent: string }
> = {
  pending: {
    label: "Pending",
    description: "Awaiting confirmation",
    accent: "border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20",
  },
  confirmed: {
    label: "Confirmed",
    description: "Ready for the chair",
    accent: "border-green-200 bg-green-50/50 dark:bg-green-950/20",
  },
  completed: {
    label: "Finished",
    description: "Completed cuts",
    accent: "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20",
  },
  cancelled: {
    label: "Cancelled",
    description: "No longer active",
    accent: "border-red-200 bg-red-50/50 dark:bg-red-950/20",
  },
};

interface BookingsKanbanColumnProps {
  status: BookingStatus;
  bookings: KanbanBooking[];
}

export function BookingsKanbanColumn({ status, bookings }: BookingsKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: "column", status },
  });

  const meta = COLUMN_META[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[420px] w-[300px] shrink-0 flex-col rounded-xl border-2 border-dashed transition-colors",
        meta.accent,
        isOver && "border-primary bg-primary/5"
      )}
    >
      <div className="border-b border-inherit p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm">{meta.label}</h3>
          <Badge variant="secondary">{bookings.length}</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {bookings.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Drop bookings here
          </p>
        ) : (
          bookings.map((booking) => (
            <BookingsKanbanCard key={booking.id} booking={booking} />
          ))
        )}
      </div>
    </div>
  );
}
