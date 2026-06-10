"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMutation } from "@tanstack/react-query";
import { BookingsFilterSummary, BookingsKanbanFilters } from "./BookingsKanbanFilters";
import { BookingsKanbanCardOverlay } from "./BookingsKanbanCard";
import { BookingsKanbanColumn } from "./BookingsKanbanColumn";
import { useToast } from "@/hooks/use-toast";
import {
  createDefaultBookingFilters,
  filterKanbanBookings,
  KANBAN_STATUSES,
  type BookingFilters,
} from "@/lib/booking-filters";
import type { BookingStatus } from "@/lib/types";
import type { KanbanBooking, ServiceOption } from "./types";

interface BookingsKanbanProps {
  initialBookings: KanbanBooking[];
  services: ServiceOption[];
}

function resolveDropStatus(
  overId: string | undefined,
  bookings: KanbanBooking[]
): BookingStatus | null {
  if (!overId) return null;
  if (KANBAN_STATUSES.includes(overId as BookingStatus)) {
    return overId as BookingStatus;
  }
  const overBooking = bookings.find((b) => b.id === overId);
  return overBooking?.status ?? null;
}

export function BookingsKanban({ initialBookings, services }: BookingsKanbanProps) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState(initialBookings);
  const [filters, setFilters] = useState<BookingFilters>(createDefaultBookingFilters);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const filteredBookings = useMemo(
    () => filterKanbanBookings(bookings, filters),
    [bookings, filters]
  );

  const visibleColumns = KANBAN_STATUSES.filter((status) =>
    filters.statuses.includes(status)
  );

  const bookingsByColumn = useMemo(() => {
    const map: Record<BookingStatus, KanbanBooking[]> = {
      pending: [],
      confirmed: [],
      completed: [],
      cancelled: [],
    };
    for (const booking of filteredBookings) {
      map[booking.status].push(booking);
    }
    return map;
  }, [filteredBookings]);

  const activeBooking = activeId
    ? bookings.find((b) => b.id === activeId) ?? null
    : null;

  const updateMutation = useMutation<
    { id: string; status: BookingStatus },
    Error,
    { id: string; status: BookingStatus },
    { previous: KanbanBooking[] }
  >({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: BookingStatus;
    }) => {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update booking");
      return { id, status };
    },
    onSuccess: ({ id, status }) => {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
      toast({ title: "Booking updated", description: `Moved to ${status}` });
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previous) {
        setBookings(context.previous);
      }
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const bookingId = String(active.id);
    const booking = bookings.find((b) => b.id === bookingId);
    const newStatus = resolveDropStatus(String(over.id), bookings);

    if (!booking || !newStatus || booking.status === newStatus) return;

    const previous = bookings;
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    updateMutation.mutate(
      { id: bookingId, status: newStatus },
      { context: { previous } }
    );
  };

  return (
    <div className="space-y-6">
      <BookingsKanbanFilters
        filters={filters}
        services={services}
        onChange={setFilters}
      />

      <BookingsFilterSummary
        total={bookings.length}
        visible={filteredBookings.length}
        filters={filters}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {visibleColumns.map((status) => (
            <BookingsKanbanColumn
              key={status}
              status={status}
              bookings={bookingsByColumn[status]}
            />
          ))}
        </div>

        <DragOverlay>
          {activeBooking ? (
            <BookingsKanbanCardOverlay booking={activeBooking} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {visibleColumns.length === 0 && (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No status columns selected. Enable at least one status in the filters above.
        </p>
      )}
    </div>
  );
}
