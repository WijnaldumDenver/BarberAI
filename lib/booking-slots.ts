import { addMinutes, format, isAfter, isBefore, parse, set } from "date-fns";
import type { BarberAvailability, Booking } from "./types";

export interface TimeSlot {
  time: string;
  datetime: Date;
  available: boolean;
}

function parseTimeOnDate(date: Date, timeStr: string): Date {
  const parsed = parse(timeStr, "HH:mm:ss", date);
  if (!isNaN(parsed.getTime())) return parsed;
  return parse(timeStr, "HH:mm", date);
}

export function generateTimeSlots(
  date: Date,
  availability: BarberAvailability[],
  bookings: Booking[],
  serviceDurationMinutes: number
): TimeSlot[] {
  const dayOfWeek = date.getDay();
  const dayAvailability = availability.filter((a) => a.day_of_week === dayOfWeek);

  if (dayAvailability.length === 0) return [];

  const slots: TimeSlot[] = [];
  const now = new Date();

  for (const window of dayAvailability) {
    let current = parseTimeOnDate(date, window.start_time);
    const end = parseTimeOnDate(date, window.end_time);

    while (addMinutes(current, serviceDurationMinutes) <= end) {
      const slotEnd = addMinutes(current, serviceDurationMinutes);
      const isPast = isBefore(slotEnd, now);

      const hasConflict = bookings.some((booking) => {
        if (booking.status === "cancelled") return false;
        const bookingStart = new Date(booking.scheduled_at);
        const bookingEnd = addMinutes(bookingStart, serviceDurationMinutes);
        return current < bookingEnd && slotEnd > bookingStart;
      });

      slots.push({
        time: format(current, "HH:mm"),
        datetime: new Date(current),
        available: !isPast && !hasConflict,
      });

      current = addMinutes(current, 30);
    }
  }

  return slots.filter((s) => s.available || slots.length <= 20);
}

export function getWeekBounds(): { start: Date; end: Date } {
  const now = new Date();
  const start = set(now, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  const end = addMinutes(start, 7 * 24 * 60 - 1);
  return { start, end };
}

export function isSlotInFuture(datetime: Date): boolean {
  return isAfter(datetime, new Date());
}
