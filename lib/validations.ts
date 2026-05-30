import { z } from "zod";
import { USER_ROLES } from "./constants";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(USER_ROLES),
  shopName: z.string().optional(),
}).refine(
  (data) => data.role !== "barber" || (data.shopName && data.shopName.length >= 2),
  { message: "Shop name is required for barbers", path: ["shopName"] }
);

export const consultSchema = z.object({
  desiredStyle: z.string().min(10, "Please describe your desired style"),
  faceShape: z.string().optional(),
  occasion: z.string().optional(),
});

export const bookingSchema = z.object({
  barberId: z.string().uuid(),
  serviceId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
  aiRecommendation: z.string().optional(),
});

export const bookingUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
});

export const serviceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(15).max(240),
  priceCents: z.number().int().min(0),
});

export const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ConsultInput = z.infer<typeof consultSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type AvailabilityInput = z.infer<typeof availabilitySchema>;
