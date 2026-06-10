"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Mail, StickyNote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { KanbanBooking } from "./types";

interface BookingsKanbanCardProps {
  booking: KanbanBooking;
  isDragging?: boolean;
}

export function BookingsKanbanCard({ booking, isDragging }: BookingsKanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging: isActive } = useDraggable({
    id: booking.id,
    data: { booking, type: "booking" },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing touch-none",
        (isDragging || isActive) && "opacity-50 shadow-lg ring-2 ring-primary/20"
      )}
    >
      <CardHeader className="flex flex-row items-start gap-2 space-y-0 p-3 pb-2">
        <button
          type="button"
          className="mt-0.5 text-muted-foreground hover:text-foreground"
          {...listeners}
          {...attributes}
          aria-label="Drag booking"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm font-medium leading-tight">
            {booking.serviceName}
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">{booking.clientName}</p>
        </div>
        <Badge variant="outline" className="shrink-0 text-[10px]">
          {booking.durationMinutes}m
        </Badge>
      </CardHeader>
      <CardContent className="space-y-1.5 p-3 pt-0 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{formatDateTime(booking.scheduledAt)}</p>
        <p>{formatPrice(booking.priceCents)}</p>
        {booking.clientEmail && (
          <p className="flex items-center gap-1 truncate">
            <Mail className="h-3 w-3 shrink-0" />
            {booking.clientEmail}
          </p>
        )}
        {booking.notes && (
          <p className="flex items-start gap-1 line-clamp-2">
            <StickyNote className="h-3 w-3 shrink-0 mt-0.5" />
            {booking.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function BookingsKanbanCardOverlay({ booking }: { booking: KanbanBooking }) {
  return (
    <Card className="w-[280px] shadow-xl ring-2 ring-primary rotate-2">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-medium">{booking.serviceName}</CardTitle>
        <p className="text-xs text-muted-foreground">{booking.clientName}</p>
      </CardHeader>
      <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
        <p>{formatDateTime(booking.scheduledAt)}</p>
      </CardContent>
    </Card>
  );
}
