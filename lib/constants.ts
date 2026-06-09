export const PLAN_LIMITS = {
  free: { aiPerDay: 5, bookingsPerMonth: 3 },
  pro: { aiPerDay: 50, bookingsPerMonth: Infinity },
} as const;

export const GEMINI_MODEL = "gemini-2.5-flash" as const;

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
] as const;

export const USER_ROLES = ["barber", "client"] as const;

export const PLANS = ["free", "pro"] as const;

export const PRO_PRICE_MONTHLY = 9;

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
